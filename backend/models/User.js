const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    homeLat: { type: Number, default: 40.7128 },
    homeLng: { type: Number, default: -74.006 },
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = (pw) => bcrypt.hash(pw, 10);
userSchema.methods.verifyPassword = function (pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
