import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every order route requires login

router.post("/", createOrder); // place a Cash on Delivery order

// NOTE: "/my-orders" must come before "/:id" for the same reason as
// "/categories" in productRoutes - specific paths before dynamic ones.
router.get("/my-orders", getMyOrders);
router.get("/", admin, getAllOrders); // admin-only: view every order
router.get("/:id", getOrderById);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
