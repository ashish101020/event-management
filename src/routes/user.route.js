const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { requestForRole, UpdateProfile } = require("../controllers/user.controller");
const User = require("../models/users.model");


const router = express.Router();

router.put("/request-organizer", authMiddleware, requestForRole);
router.put("/profile", authMiddleware, UpdateProfile);


module.exports = router;