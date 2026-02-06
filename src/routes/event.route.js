const express = require("express");
const upload = require("../middlewares/multer.middleware");
const { createEvent, deleteEventByOrganizer, editEvent, getAllEvents } = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeAll } = require("../middlewares/authorize.middleware");

const router = express.Router();

router.get("/:eventId", authMiddleware, async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error(error);

    // Invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", authMiddleware, authorizeAll, upload.array("image", 5), createEvent);

router.delete("/:eventId", authMiddleware, authorizeAll, deleteEventByOrganizer);

router.put("/:eventId", authMiddleware, authorizeAll, upload.array("photos", 5), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startDate, endDate, startTime, endTime, location, eventType, category } = req.body;
    const organizer = req.user.id;

    const event = await Event.findOne({ _id: eventId, organizer });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const files = req.files || [];

    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "eventsImages",
      });
      fs.unlinkSync(file.path);

      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    });

    const newPhotos = await Promise.all(uploadPromises);

    // Update fields safely
    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.startDate = startDate ?? event.startDate;
    event.endDate = endDate ?? event.endDate;
    event.startTime = startTime ?? event.startTime;
    event.endTime = endTime ?? event.endTime;
    event.location = location ?? event.location;
    event.eventType = eventType ?? event.eventType;
    event.category = category ?? event.category;

    if (newPhotos.length) {
      event.photos.push(...newPhotos);
    }

    await event.save();

    res.status(200).json({ message: "Event updated", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
