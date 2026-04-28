const { bias, weights } = require("./weights");

const CATEGORY_RISK = {
  grocery: 0.0, electronics: 0.4, travel: 0.5,
  gambling: 1.0, atm: 0.9, online: 0.6, other: 0.2,
};

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function buildFeatures(tx, user, history) {
  const hour = new Date(tx.timestamp || Date.now()).getHours();
  const hourRisk = hour <= 5 || hour === 23 ? 1 : 0;
  const distanceKm = haversineKm(user.homeLat, user.homeLng, tx.lat, tx.lng);
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const velocity = history.filter((h) => new Date(h.timestamp).getTime() > oneHourAgo).length;
  const userMean =
    history.length > 0
      ? history.reduce((s, h) => s + h.amount, 0) / history.length
      : tx.amount;
  const amountRatio = userMean > 0 ? tx.amount / userMean : 1;

  return {
    logAmount: Math.log10(1 + tx.amount),
    hourRisk,
    distanceKm,
    velocity,
    amountRatio,
    categoryRisk: CATEGORY_RISK[tx.category] ?? 0.2,
    online: tx.isOnline ? 1 : 0,
  };
}

function predict(tx, user, history = []) {
  const x = buildFeatures(tx, user, history);
  let z = bias;
  const contribs = {};
  for (const k of Object.keys(weights)) {
    const c = weights[k] * x[k];
    z += c;
    contribs[k] = +c.toFixed(4);
  }
  const score = sigmoid(z);
  return {
    score: +score.toFixed(4),
    isFraud: score >= 0.5,
    features: x,
    contributions: contribs,
  };
}

// Evaluate against a labeled test set: [{tx, user, history, label}]
function evaluate(samples) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const s of samples) {
    const p = predict(s.tx, s.user, s.history || []).isFraud ? 1 : 0;
    const y = s.label ? 1 : 0;
    if (p === 1 && y === 1) tp++;
    else if (p === 1 && y === 0) fp++;
    else if (p === 0 && y === 0) tn++;
    else fn++;
  }
  const precision = tp / Math.max(1, tp + fp);
  const recall = tp / Math.max(1, tp + fn);
  const f1 = (2 * precision * recall) / Math.max(1e-9, precision + recall);
  const accuracy = (tp + tn) / Math.max(1, samples.length);
  return { tp, fp, tn, fn, precision, recall, f1, accuracy, n: samples.length };
}

module.exports = { predict, evaluate, buildFeatures };
