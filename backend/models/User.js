const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false // Don't return password by default
    },
    homeLat: {
      type: Number,
      default: 40.7128,
      min: [-90, "Latitude must be >= -90"],
      max: [90, "Latitude must be <= 90"]
    },
    homeLng: {
      type: Number,
      default: -74.006,
      min: [-180, "Longitude must be >= -180"],
      max: [180, "Longitude must be <= 180"]
    },
    transactionCount: {
      type: Number,
      default: 0
    },
    fraudCount: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Static method to hash password
userSchema.statics.hashPassword = (pw) => bcrypt.hash(pw, 10);

// Instance method to verify password
userSchema.methods.verifyPassword = function (pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Remove password from JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model("User", userSchema);
