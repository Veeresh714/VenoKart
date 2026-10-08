import mongoose from "mongoose";

// A cart has many items - we model this as a sub-document array.
// Sub-documents are objects embedded directly inside the parent document,
// rather than stored in their own separate collection. This makes sense
// here because cart items always belong to exactly one cart and are
// always read/written together with it.
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // snapshot of product name at add-time
  image: { type: String, required: true }, // snapshot of image
  price: { type: Number, required: true }, // snapshot of price
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    // One cart per user. "unique: true" enforces this at the DB level.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
