const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    startDate: { type: String, required: true }, 
    startTime: { type: String, required: true }, 

    endDate: { type: String, required: true },
    endTime: { type: String, required: true },

    location: { type: String, required: true },

    eventType: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    category: { type: String, required: true },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photos: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("events", eventSchema);
