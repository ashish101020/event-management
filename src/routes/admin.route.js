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
  authorize(['Admin']),
  async (req, res) => {
    try {
      const { user_id, response } = req.params;
      console.log(user_id)

      const request = await RequestedUser.findOne(user_id);
      if (!request) {
        return res.status(404).json({ message: "Organizer request not found" });
      }

      if(response === 'reject'){
        await RequestedUser.findByIdAndDelete(request._id);
      res.status(200).json({ message: "User rejected for Organizer" });
      }

      await User.findByIdAndUpdate(user_id, { role: "Organizer" });

      await RequestedUser.findByIdAndDelete(request._id);

      res.status(200).json({ message: "User approved as Organizer" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



router.delete("/event/:eventId", authMiddleware, authorize(['Admin']), async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventExist = await Event.findById(eventId);
    if (!eventExist) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Delete images from Cloudinary
    for (const photo of eventExist.photos) {
      if (photo.public_id) {
        await cloudinary.uploader.destroy(photo.public_id);
      }
    }

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ success: true, message: "Event deleted by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
});



module.exports = router;