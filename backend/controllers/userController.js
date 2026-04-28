const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { name, homeLat, homeLng } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (homeLat != null) updates.homeLat = +homeLat;
  if (homeLng != null) updates.homeLng = +homeLng;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-passwordHash");
  
  res.json(user);
};
