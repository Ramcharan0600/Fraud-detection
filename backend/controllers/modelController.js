const { evaluate } = require("../ml/fraudModel");

// Synthetic test set used for the evaluate endpoint
function buildTestSet() {
  const baseUser = { homeLat: 40.7128, homeLng: -74.006 };
  const samples = [];
  // 50 legit
  for (let i = 0; i < 50; i++) {
    samples.push({
      tx: {
        amount: 20 + Math.random() * 80,
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
  // 50 fraud
  for (let i = 0; i < 50; i++) {
    samples.push({
      tx: {
        amount: 800 + Math.random() * 5000,
        category: ["gambling", "atm", "electronics"][i % 3],
        lat: 40.7128 + (Math.random() - 0.5) * 8,
        lng: -74.006 + (Math.random() - 0.5) * 8,
        isOnline: true,
        timestamp: new Date().setHours(2),
      },
      user: baseUser,
      history: Array.from({ length: 4 }, (_, k) => ({
        amount: 50, timestamp: new Date(Date.now() - k * 600 * 1000),
      })),
      label: 1,
    });
  }
  return samples;
}

exports.evaluate = (_req, res) => {
  try {
    const metrics = evaluate(buildTestSet());
    res.success(metrics, "Model evaluation completed");
  } catch (err) {
    res.error(err, 500);
  }
};
