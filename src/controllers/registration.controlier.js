const Event = require('../models/events.model');
const Registration = require('../models/registration.model');

const applyRegistration = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyRegistered = await Registration.findOne({ eventId, userId });
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    await Registration.create({ eventId, userId });

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id || req.user._id;

    const registration = await Registration.findOneAndDelete({ eventId, userId });

    if (!registration) {
      return res.status(404).json({ message: "You are not registered for this event" });
    }

    res.status(200).json({ message: "Registration cancelled" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllRegistration = async (req, res) => {
    const user = req.user.id;

    try {
      let registrations;

      if(req.user.role === 'Admin'){
        registrations = await Registration.find();
      }
    } catch (error) {
      console.error(error);
    }
}

module.exports = { applyRegistration, deleteRegistration };