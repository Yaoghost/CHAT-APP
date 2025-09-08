import express from "express";
import protectRoute from "../middleware/auth.middleware.js"; // ensures token validity before fulfilling request
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
// protectRoute is invoked everythime we  make request while logged in
//protectRoute is a middleware -> middleware handles prealable work
router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
