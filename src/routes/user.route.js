const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { UpdateProfile, requestForUpgradeRole } = require("../controllers/user.controller");


const router = express.Router();

router.put("/request-organizer", authMiddleware, requestForUpgradeRole);
router.put("/profile", authMiddleware, UpdateProfile);


module.exports = router;