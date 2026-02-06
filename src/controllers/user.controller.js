const requestedUser = require("../models/requestForRole.model");
const User = require("../models/users.model");

const requestForRole = async (req, res) => {
  const userId = req.user.id;
  console.log("here");
  try {
    const alreadyRequested = await requestedUser.findOne({ userId });
    if (alreadyRequested) {
      return res.status(400).json({ message: "Request already submitted" });
    }
    await requestedUser.create({ userId });

    res
      .status(200)
      .json({ message: "Organizer request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { requestForRole, UpdateProfile };