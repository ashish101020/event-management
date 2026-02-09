const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const RequestedUser = require('../models/requestForRole.model');
const User = require('../models/users.model');

const router = express.Router();

router.get(
  "/organizer-requests",
  authMiddleware,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const requests = await RequestedUser.find()
        .populate({
          path: "userId",
          select: "name email avatar role createdAt",
        })
        .sort({ createdAt: -1 }); // newest first (optional but nice)

      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);


router.put(
  "/users/:user_id/approve-organizer/:response",
  authMiddleware,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const { user_id, response } = req.params;

      //  Find organizer request using userId field
      const request = await RequestedUser.findOne({ userId: user_id });
      if (!request) {
        return res.status(404).json({ message: "Organizer request not found" });
      }

      //  Reject flow
      if (response === "reject") {
        await RequestedUser.findByIdAndDelete(request._id);
        return res.status(200).json({ success: true, message: "User rejected for Organizer" });
      }

      //  Approve flow
      if (response === "accept") {
        await User.findByIdAndUpdate(user_id, { role: "Organizer" });

        await RequestedUser.findByIdAndDelete(request._id);

        return res.status(200).json({ success: true, message: "User approved as Organizer" });
      }

      // Invalid response
      res.status(400).json({ success:false, message: "Invalid response type" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



module.exports = router;