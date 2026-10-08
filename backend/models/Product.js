import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    brand: {
      type: String,
      default: "Generic",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    // We store the image path (e.g. "/uploads/products/xyz.jpg"), not the
    // raw image binary. The actual file lives on disk; MongoDB just
    // remembers WHERE to find it. This keeps documents small and fast.
    image: {
      type: String,
      default: "/uploads/products/no-image.png",
    },
    // Reference to the admin user who created this product.
    // "ref: User" tells Mongoose this ID points to a document in the
    // "User" collection, enabling .populate() to fetch full user details later.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Denormalized rating fields - storing computed averages directly
    // on the product avoids recalculating from reviews on every page load.
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index enables MongoDB's $text search across these fields,
// powering our "search products" feature efficiently.
productSchema.index({ name: "text", description: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
