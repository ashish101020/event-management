const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const RequestedUser = require('../models/requestForRole.model');
const User = require('../models/users.model');

const router = express.Router();

router.get(
  "/organizer-requests",
  authMiddleware,
  authorize(),
  async (req, res) => {
    try {
      console.log("herre");
      const requests = await RequestedUser.find();
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



router.put(
  "/users/:user_id/approve-organizer",
  authMiddleware,
  authorize(),
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const request = await RequestedUser.findOne({ userId: user_id });
      if (!request) {
        return res.status(404).json({ message: "Organizer request not found" });
      }


      await User.findByIdAndUpdate(user_id, { role: "Organizer" });
  
      await RequestedUser.deleteOne({ userId: user_id });

      res.status(200).json({ message: "User approved as Organizer" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


router.delete("/event/:eventId", authMiddleware, authorize(), async (req, res) => {
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