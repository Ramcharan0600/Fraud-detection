// Pretrained logistic-regression weights (calibrated on synthetic data).
// score = sigmoid(bias + Σ w_i * x_i)
module.exports = {
  bias: -3.2,
  weights: {
    logAmount:        0.55,   // log10(1 + amount)
    hourRisk:         0.85,   // 1 if 0-5h or 23h, else 0
    distanceKm:       0.012,  // distance from home
    velocity:         0.65,   // # tx in last 1h
    amountRatio:      0.40,   // amount / userMeanAmount
    categoryRisk:     1.20,   // gambling/atm = high
    online:           0.45,
  },
};
