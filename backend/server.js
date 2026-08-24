import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load variables from .env into process.env. MUST happen before
// anything that reads process.env (like connectDB or generateToken).
dotenv.config();

// Connect to MongoDB before the server starts accepting requests.
connectDB();

const app = express();

// ---------------------------------------------------------
// GLOBAL MIDDLEWARE (runs on EVERY request, in this order)
// ---------------------------------------------------------

// cors() allows our React app (on a different port, e.g. localhost:5173)
// to make requests to this API (on localhost:5000). Without this,
// browsers block the request due to the "Same-Origin Policy".
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// express.json() parses incoming requests with JSON bodies
// (e.g. { "email": "a@a.com" }) and makes them available as req.body.
// Without this, req.body would be undefined.
app.use(express.json());

// express.urlencoded() parses form-submitted data (not used much with
// React + Axios, but good practice to include).
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images as static files.
// e.g. a file saved at /uploads/products/shoe.jpg becomes accessible at
// http://localhost:5000/uploads/products/shoe.jpg
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------
// Every route inside authRoutes.js is now prefixed with /api/auth
// e.g. router.post("/login", ...) becomes POST /api/auth/login
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Simple health check route - useful to confirm the API is alive.
app.get("/", (req, res) => {
  res.send("🛒 E-Commerce API is running...");
});

// ---------------------------------------------------------
// ERROR HANDLING (must be registered LAST, after all routes)
// ---------------------------------------------------------
app.use(notFound); // catches unmatched routes -> 404
app.use(errorHandler); // catches all errors thrown anywhere above

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
