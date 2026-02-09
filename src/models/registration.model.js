const { Schema, model } = require("mongoose");

const registrationSchema = new Schema({
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

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });


const Registration = model('registered-events', registrationSchema);

module.exports = Registration;