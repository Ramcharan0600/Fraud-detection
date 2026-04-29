const { evaluate } = require("../ml/fraudModel");
const logger = require("../utils/logger");

// Synthetic test set used for the evaluate endpoint
function buildTestSet() {
  const baseUser = { homeLat: 40.7128, homeLng: -74.006, _id: "test-user" };
  const samples = [];
  
  // 50 legitimate transactions
  for (let i = 0; i < 50; i++) {
    samples.push({
      tx: {
        amount: 20 + Math.random() * 80,
        merchant: `Store ${i}`,
        category: ["grocery", "online", "other"][i % 3],
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
        isOnline: i % 4 === 0,
        timestamp: new Date(Date.now() - i * 3600 * 1000).setHours(14),
      },
      user: baseUser,
      history: [],
      label: 0,
    });
  }
  
  // 50 fraudulent transactions
  for (let i = 0; i < 50; i++) {
    samples.push({
      tx: {
        amount: 800 + Math.random() * 5000,
        merchant: `Fraudulent Merchant ${i}`,
        category: ["gambling", "atm", "electronics"][i % 3],
        lat: 40.7128 + (Math.random() - 0.5) * 8,
        lng: -74.006 + (Math.random() - 0.5) * 8,
        isOnline: true,
        timestamp: new Date().setHours(2),
      },
      user: baseUser,
      history: Array.from({ length: 4 }, (_, k) => ({
        amount: 50,
        timestamp: new Date(Date.now() - k * 600 * 1000),
      })),
      label: 1,
    });
  }
  return samples;
}

exports.evaluate = (_req, res) => {
  try {
    const testSet = buildTestSet();
    const metrics = evaluate(testSet);
    
    logger.info("Model evaluation completed", metrics);
    
    res.success(
      {
        ...metrics,
        model: "Logistic Regression",
        features: 7,
        description: "Evaluation on synthetic test set"
      },
      "Model evaluation completed"
    );
  } catch (err) {
    logger.error("Model evaluation error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Model evaluation failed"
    });
  }
};
