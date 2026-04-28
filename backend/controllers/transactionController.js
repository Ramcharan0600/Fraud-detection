const Transaction = require("../models/Transaction");
const { predict } = require("../ml/fraudModel");

exports.create = async (req, res) => {
  try {
    const { amount, merchant, category, lat, lng, isOnline, timestamp } = req.body;

    const history = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const tx = { amount, merchant, category, lat, lng, isOnline, timestamp: timestamp || new Date() };
    const result = predict(tx, req.user, history);

    const saved = await Transaction.create({
      ...tx,
      user: req.user._id,
      fraudScore: result.score,
      isFraud: result.isFraud,
      featureContribs: result.contributions,
    });

    res.success(
      { transaction: saved, prediction: result },
      "Transaction created successfully",
      201
    );
  } catch (err) {
    res.error(err, 500);
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
        .limit(limit),
      Transaction.countDocuments({ user: req.user._id }),
    ]);

    res.success({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    res.error(err, 500);
  }
};

exports.stats = async (req, res) => {
  try {
    const all = await Transaction.find({ user: req.user._id });
    const total = all.length;
    const fraud = all.filter((t) => t.isFraud).length;
    const totalAmount = all.reduce((s, t) => s + t.amount, 0);
    const fraudAmount = all.filter((t) => t.isFraud).reduce((s, t) => s + t.amount, 0);

    res.success({
      total,
      fraud,
      fraudRate: total ? fraud / total : 0,
      totalAmount,
      fraudAmount,
    });
  } catch (err) {
    res.error(err, 500);
  }
};

exports.bulk = async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ success: false, error: "transactions array required" });
    }

    if (transactions.length > 1000) {
      return res.status(400).json({ success: false, error: "Cannot import more than 1000 transactions at once" });
    }

    const history = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const created = [];
    for (const tx of transactions) {
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
    }

    res.success(
      { created: created.length, transactions: created },
      `Successfully imported ${created.length} transactions`,
      201
    );
  } catch (err) {
    res.error(err, 500);
  }
};
