const axios = require("axios");
const jwt = require("jsonwebtoken");
const { oAuth2Client } = require("../config/googleConfig");
const User = require("../models/users.model");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
require('dotenv').config();


const generateToken = ({ id, role }) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
};

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Authorization code required" });
    }
    
    //  Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    //  Fetch Google profile
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const { email, name, picture, id: google_id } = userRes.data;

    //  Check if user exists
    let userExisted = await User.findOne({ email });
    let user;

    if (!userExisted) {
      user = await User.create({
        google_id,
        email,
        name,
        avatar: picture,
        role: "Participant",
      });
    } else {
      user = userExisted;
    }

    //  Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    // Response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.avatar,
        role:user.role
      },
    });

  } catch (error) {
    console.error("Google OAuth Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};


const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // 🔍 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let avatarData = null;

    // 📸 Case 1: Avatar uploaded as file (multer)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "userAvatars",
      });

      // Delete local file after upload
      fs.unlinkSync(req.file.path);

      avatarData = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // 🌐 Case 2: Avatar URL sent directly from frontend
    else if (avatar) {
      avatarData = {
        url: avatar,
        public_id: null,
      };
    }

    // 👤 Create user
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarData,
      role: "Participant",
    });

    // 🔐 Generate token
    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      user: {
        id:user._id,
        name: user.name,
        email:user.email,
        role:user.role,
        avatar: user.avatar
      },
      token,
      message: "User Registered Successfully!",
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 🔍 Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔐 Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🎟 Generate token
    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email:user.email,
        role:user.role,
        avatar:user.avatar
      },
      token,
      message: "Login Successfully!",
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { googleLogin, register, login };
