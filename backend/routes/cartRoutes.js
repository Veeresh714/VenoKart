import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every cart route requires the user to be logged in - "protect" runs
// on ALL of them, so we apply it once here with router.use() instead
// of repeating it on every single route below.
router.use(protect);

router.route("/").get(getCart).post(addToCart).delete(clearCart);

router.route("/:itemId").put(updateCartItem).delete(removeCartItem);

export default router;
