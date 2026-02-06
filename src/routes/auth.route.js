const express = require("express");
const { googleLogin, register, login } = require("../controllers/auth.controller");
const upload = require("../middlewares/multer.middleware");

const router = express.Router();

router.post("/register", upload.single("avatar"), register);


router.post("/login", login);

router.post("/google", googleLogin);

module.exports = router;
