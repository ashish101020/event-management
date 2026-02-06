const fs = require("fs");
const Event = require("../models/events.model");
const cloudinary = require("../config/cloudinary");

// ================= CREATE EVENT =================
const createEvent = async (req, res) => {
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

    const organizer = req.user.id;

    const files = req.files || [];
    let photos = [];

    if (files.length) {
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

      photos = await Promise.all(uploadPromises);
    }

    if (image) {
      photos.push({
        url: image,
        public_id: null,
      });
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

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= DELETE BY ORGANIZER =================
const deleteEventByOrganizer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const createrId = req.user.id; // logged-in organizer

    const eventExist = await Event.findOne({ _id: eventId, organizer: createrId });
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

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

// ================= EDIT EVENT =================
const editEvent = async (req, res) => {
  try {
    const { eventId, title, description, date, location, eventType, category } =
      req.body;
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
    event.startTime = startDate ?? event.startTime;
    event.endTime = endDate ?? event.endTime;
    event.location = location ?? event.location;
    event.eventType = eventType ?? event.eventType;
    event.category = category ?? event.category;

    if (newPhotos.length) {
      event.photos.push(...newPhotos);
    }

    await event.save();

    res.status(200).json({ message: "Event updated"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

const getEventById = async (req, res) => {
  const { eventId } = req.params;
  try {
    const existingEvent = await Event.findOne({eventId});
    if(!existingEvent) {
      res.status(200).json(existingEvent);
    }
  } catch (error) {
    res.status(500).json({message: "Server Error"});
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
  createEvent,
  deleteEventByOrganizer,
  editEvent,
  endEvent,
  getAllEvents,
  getEventById
};
