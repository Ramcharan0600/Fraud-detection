const Transaction = require("../models/Transaction");
const { predict } = require("../ml/fraudModel");
const logger = require("../utils/logger");

exports.create = async (req, res) => {
  try {
    const { amount, merchant, category, lat, lng, isOnline, timestamp } = req.body;

    const history = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const tx = {
      amount,
      merchant: merchant.trim(),
      category: category || "other",
      lat,
      lng,
      isOnline: isOnline || false,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };

    const result = predict(tx, req.user, history);

    const saved = await Transaction.create({
      ...tx,
      user: req.user._id,
      fraudScore: result.score,
      isFraud: result.isFraud,
      featureContribs: result.contributions,
    });

    logger.info("Transaction created", {
      userId: req.user._id,
      transactionId: saved._id,
      fraudScore: result.score,
      isFraud: result.isFraud
    });

    res.status(201).json({
      success: true,
      data: {
        transaction: saved,
        prediction: result
      },
      message: `Transaction ${result.isFraud ? 'flagged as' : 'classified as'} ${result.isFraud ? 'suspicious' : 'legitimate'}`
    });
  } catch (err) {
    logger.error("Error creating transaction", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to create transaction"
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const skip = (page - 1) * limit;

    const [items, totalCount] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1,
        },
      },
      message: "Transactions retrieved successfully"
    });
  } catch (err) {
    logger.error("Error listing transactions", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to retrieve transactions"
    });
  }
};

exports.stats = async (req, res) => {
  try {
    const all = await Transaction.find({ user: req.user._id }).lean();
    
    const total = all.length;
    const fraud = all.filter((t) => t.isFraud).length;
    const totalAmount = all.reduce((s, t) => s + t.amount, 0);
    const fraudAmount = all.filter((t) => t.isFraud).reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown = {};
    all.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { count: 0, fraudCount: 0, amount: 0 };
      }
      categoryBreakdown[t.category].count++;
      categoryBreakdown[t.category].amount += t.amount;
      if (t.isFraud) {
        categoryBreakdown[t.category].fraudCount++;
      }
    });

    res.json({
      success: true,
      data: {
        total,
        fraud,
        fraudRate: total ? (fraud / total).toFixed(4) : 0,
        totalAmount: totalAmount.toFixed(2),
        fraudAmount: fraudAmount.toFixed(2),
        categoryBreakdown,
        avgFraudScore: total ? (all.reduce((s, t) => s + t.fraudScore, 0) / total).toFixed(4) : 0,
      },
      message: "Statistics retrieved successfully"
    });
  } catch (err) {
    logger.error("Error calculating stats", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to calculate statistics"
    });
  }
};

exports.bulk = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: "transactions must be an array"
      });
    }

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one transaction is required"
      });
    }

    if (transactions.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Cannot import more than 1000 transactions at once"
      });
    }

    const history = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const created = [];
    let errors = [];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const tx = transactions[i];
        
        if (!tx.amount || !tx.merchant || tx.lat == null || tx.lng == null) {
          errors.push(`Transaction ${i + 1}: Missing required fields`);
          continue;
        }

        const r = predict(tx, req.user, history);
        const saved = await Transaction.create({
          ...tx,
          user: req.user._id,
          fraudScore: r.score,
          isFraud: r.isFraud,
          featureContribs: r.contributions,
        });
        created.push(saved);
        history.unshift(saved.toObject());
      } catch (err) {
        errors.push(`Transaction ${i + 1}: ${err.message}`);
      }
    }

    logger.info("Bulk import completed", {
      userId: req.user._id,
      totalRequested: transactions.length,
      created: created.length,
      errors: errors.length
    });

    res.status(201).json({
      success: created.length > 0,
      data: {
        created: created.length,
        transactions: created,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully imported ${created.length}/${transactions.length} transactions`
    });
  } catch (err) {
    logger.error("Error in bulk import", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Bulk import failed"
    });
  }
};
