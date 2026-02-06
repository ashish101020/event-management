const fs = require("fs");
const Event = require("../models/events.model");
const cloudinary = require("../config/cloudinary");


const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    let event;

    if (req.user.role === "Admin") {
      event = await Event.findById(eventId);
    } else {
      event = await Event.findOne({ _id: eventId, organizer: req.user.id });
    }

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Delete images from Cloudinary
    for (const photo of event.photos) {
      if (photo.public_id) {
        await cloudinary.uploader.destroy(photo.public_id);
      }
    }

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};


const endEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const createrId = req.user.id;

    const event = await Event.findOne({ _id: eventId, createrId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "Completed";
    await event.save();

    res.json({ message: "Event marked as completed", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const getAllEvents = async (req, res) => {
  try {
    const { title, type, location, date } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // 🔍 Search by title (partial, case-insensitive)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // filter by event type
    if (type) {
      filter.eventType = type;
    }

    // filter by location (partial match)
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // filter by date (same day)
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  deleteEvent,
  endEvent,
  getAllEvents,
};
