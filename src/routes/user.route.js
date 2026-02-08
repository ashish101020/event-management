const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { UpdateProfile, requestForUpgradeRole } = require("../controllers/user.controller");
const upload = require("../middlewares/multer.middleware");


const router = express.Router();

router.put("/request-organizer", authMiddleware, requestForUpgradeRole);
router.put("/profile", upload.single('avatar'), authMiddleware, UpdateProfile);


module.exports = router;