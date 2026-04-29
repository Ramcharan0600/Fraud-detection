const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
      max: [1000000, "Amount cannot exceed 1,000,000"]
    },
    merchant: {
      type: String,
      required: [true, "Merchant is required"],
      trim: true,
      minlength: [1, "Merchant name is required"],
      maxlength: [100, "Merchant name cannot exceed 100 characters"]
    },
    category: {
      type: String,
      enum: {
        values: ["grocery", "electronics", "travel", "gambling", "atm", "online", "other"],
        message: "Category must be one of: grocery, electronics, travel, gambling, atm, online, other"
      },
      default: "other"
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be >= -90"],
      max: [90, "Latitude must be <= 90"]
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be >= -180"],
      max: [180, "Longitude must be <= 180"]
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    fraudScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    isFraud: {
      type: Boolean,
      default: false,
      index: true
    },
    featureContribs: {
      type: Object,
      default: {}
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewNotes: String
  },
  { timestamps: true }
);

// Compound indexes for better query performance
transactionSchema.index({ user: 1, timestamp: -1 });
transactionSchema.index({ user: 1, isFraud: 1, timestamp: -1 });
transactionSchema.index({ user: 1, fraudScore: -1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ isFraud: 1, timestamp: -1 });
transactionSchema.index({ createdAt: -1 });

// TTL index for automatic deletion of old transactions (optional, set to 2 years)
// Uncomment to enable: transactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Ensure coordinates are valid
transactionSchema.pre("validate", function (next) {
  if (this.lat < -90 || this.lat > 90 || this.lng < -180 || this.lng > 180) {
    next(new Error("Invalid coordinates"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
