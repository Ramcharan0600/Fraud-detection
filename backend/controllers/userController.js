const User = require("../models/User");
const logger = require("../utils/logger");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.success(user, "Profile retrieved successfully");
  } catch (err) {
    logger.error("Error retrieving profile", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to retrieve profile"
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, homeLat, homeLng } = req.body;
    const updates = {};

    if (name) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: "Name must be at least 2 characters"
        });
      }
      updates.name = name.trim();
    }

    if (homeLat != null) {
      const lat = parseFloat(homeLat);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          error: "Invalid latitude"
        });
      }
      updates.homeLat = lat;
    }

    if (homeLng != null) {
      const lng = parseFloat(homeLng);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: "Invalid longitude"
        });
      }
      updates.homeLng = lng;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    logger.info("User profile updated", { userId: req.user._id, updates: Object.keys(updates) });
    
    res.success(user, "Profile updated successfully");
  } catch (err) {
    logger.error("Error updating profile", { userId: req.user._id, error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to update profile"
    });
  }
};
