const { Schema, model } = require("mongoose");

const requestForRoleSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true
  }
}, { timestamps: true });

const RequestedUser = model('requesteduser', requestForRoleSchema);

module.exports = RequestedUser;