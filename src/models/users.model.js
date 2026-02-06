const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    avatar: {
      url: String,
      public_id: String,
    },

    role: {
      type: String,
      enum: ["Admin", "Organizer", "User"],
      default: "User",
    },
    participatedEventsId: [
      {
        type: Schema.Types.ObjectId,
        ref: "events",
      },
    ],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = model("users", userSchema);

module.exports = User;
