const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const RegisteredEvent = require('../models/registeredEvent.model');
const Event = require('../models/events.model');
const router = express.Router();

router.post("/:eventId", authMiddleware, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyRegistered = await RegisteredEvent.findOne({ eventId, userId });
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    await RegisteredEvent.create({ eventId, userId });

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const mongoose = require("mongoose");

router.delete("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id || req.user._id;

    const registration = await RegisteredEvent.findOneAndDelete({ eventId, userId });

    if (!registration) {
      return res.status(404).json({ message: "You are not registered for this event" });
    }

    res.status(200).json({ message: "Registration cancelled" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;