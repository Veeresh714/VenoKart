import express from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// IMPORTANT: specific routes like "/categories" must be declared
// BEFORE the dynamic "/:id" route. Otherwise Express would try to
// match "categories" as an :id value and call getProductById instead!
router.get("/categories", getCategories);

router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes. Middleware chain: protect -> admin -> upload -> controller
// "upload.single('image')" tells multer to expect ONE file from a form
// field named "image", and parse the rest of the form fields into req.body.
router.post("/", protect, admin, upload.single("image"), createProduct);
router.put("/:id", protect, admin, upload.single("image"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
