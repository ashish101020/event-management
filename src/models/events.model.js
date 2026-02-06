const { Schema, model } = require("mongoose");

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endDate: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, required: true },
  eventType: { type: String, enum: ["online", "offline"] },
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
  category: { type: String },

  organizer: { type: Schema.Types.ObjectId, ref: "users", required: true },

  photos: [
    {
      url: String,
      public_id: String,
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = model("events", eventSchema);
