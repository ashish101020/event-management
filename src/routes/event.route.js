const express = require("express");
const upload = require("../middlewares/multer.middleware");
const { createEvent, deleteEventByOrganizer, editEvent, getAllEvents } = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeAll } = require("../middlewares/authorize.middleware");
const Event = require("../models/events.model");


const router = express.Router();

router.get("/:eventId", authMiddleware, async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({title: event.title, description: event.description});
  } catch (error) {
    console.error(error);

    // Invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", authMiddleware, authorizeAll(), upload.array("image", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      eventType,
      category,
      image,
    } = req.body;

    const organizer = req.user.id || req.user._id;

    const files = req.files || [];
    let photos = [];

    if (files.length) {
      const uploadPromises = files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "eventsImages",
        });
        fs.unlinkSync(file.path);

        return { url: result.secure_url, public_id: result.public_id };
      });

      photos = await Promise.all(uploadPromises);
    }

    if (image) {
      photos.push({ url: image, public_id: null });
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      eventType,
      category,
      organizer,
      photos,
    });

    const createdEvent = event.toObject();
    createdEvent.organizer = createdEvent.organizer.toString();

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:eventId", authMiddleware, authorizeAll(), deleteEventByOrganizer);

router.put("/:eventId", authMiddleware, authorizeAll(), upload.array("photos", 5), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startDate, endDate, startTime, endTime, location, eventType, category } = req.body;

    let event;

    if (req.user.role === "Admin") {
      event = await Event.findById(eventId);
    } else {
      event = await Event.findOne({ _id: eventId, organizer: req.user.id });
    }

    if (!event) return res.status(404).json({ message: "Event not found" });

    const files = req.files || [];

    const uploadPromises = files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { folder: "eventsImages" });
      fs.unlinkSync(file.path);
      return { url: result.secure_url, public_id: result.public_id };
    });

    const newPhotos = await Promise.all(uploadPromises);

    // Safe field updates
    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.startDate = startDate ?? event.startDate;
    event.endDate = endDate ?? event.endDate;
    event.startTime = startTime ?? event.startTime;
    event.endTime = endTime ?? event.endTime;
    event.location = location ?? event.location;
    event.eventType = eventType ?? event.eventType;
    event.category = category ?? event.category;

    if (newPhotos.length) event.photos.push(...newPhotos);

    await event.save();

    const updatedEvent = event.toObject();
    updatedEvent.organizer = updatedEvent.organizer.toString();

    res.status(200).json({ message: "Event updated", event: updatedEvent });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
