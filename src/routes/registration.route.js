const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { applyRegistration, deleteRegistration } = require('../controllers/registration.controlier');
const router = express.Router();

router.post("/:eventId", authMiddleware, applyRegistration);

router.delete("/:eventId", authMiddleware, deleteRegistration );


module.exports = router;