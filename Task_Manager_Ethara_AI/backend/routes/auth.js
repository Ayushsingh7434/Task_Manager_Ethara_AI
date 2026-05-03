const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST /api/auth/register  — Register new user
// POST /api/auth/signup    — Alias (for frontend compatibility)
router.post("/register", register);
router.post("/signup", register);

// POST /api/auth/login     — Login
router.post("/login", login);

// GET  /api/auth/me        — Get logged-in user profile (protected)
router.get("/me", protect, getMe);

module.exports = router;
