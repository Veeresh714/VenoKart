import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

// express.Router() creates a mini standalone router - a "sub-app" we can
// mount onto our main app at a specific base path (e.g. /api/auth).
const router = express.Router();

// Public routes - anyone can call these, no token needed.
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes - "protect" middleware runs FIRST. If the token is
// invalid, the request never reaches getUserProfile/updateUserProfile.
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
