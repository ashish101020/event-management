const requestedUser = require("../models/requestForRole.model");
const User = require("../models/users.model");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const requestForUpgradeRole = async (req, res) => {
  const userId = req.user.id;
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
    const { name, avatar } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✏️ Update name
    if (name) user.name = name;

    let avatarData = user.avatar;

    // 📸 Case 1: New avatar uploaded as file
    if (req.file) {
      // Delete old avatar from Cloudinary (if exists)
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "userAvatars",
      });

      fs.unlinkSync(req.file.path);

      avatarData = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // 🌐 Case 2: Avatar URL sent directly
    else if (avatar) {
      // Delete old Cloudinary avatar if it existed
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      avatarData = {
        url: avatar,
        public_id: null,
      };
    }

    user.avatar = avatarData;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = { requestForUpgradeRole, UpdateProfile };