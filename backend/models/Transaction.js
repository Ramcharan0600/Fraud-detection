const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    merchant: { type: String, required: true },
    category: {
      type: String,
      enum: ["grocery", "electronics", "travel", "gambling", "atm", "online", "other"],
      default: "other",
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isOnline: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    fraudScore: { type: Number, default: 0 },
    isFraud: { type: Boolean, default: false },
    featureContribs: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
