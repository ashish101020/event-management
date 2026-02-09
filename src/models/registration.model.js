const { Schema, model } = require("mongoose");

const registrationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });


const Registration = model('registered-events', registrationSchema);

module.exports = Registration;