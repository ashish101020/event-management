const { Schema, model } = require("mongoose");

const registeredEventSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "events",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
}, { timestamps: true });

registeredEventSchema.index({ eventId: 1, userId: 1 }, { unique: true });


const RegisteredEvent = model('registered-event', registeredEventSchema);

module.exports = RegisteredEvent;