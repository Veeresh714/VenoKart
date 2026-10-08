import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

// Small internal helper - every cart route needs the current user's cart,
// creating one if it doesn't exist yet. Not exported; only used in this file.
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json(cart);
});

// @desc    Add an item to cart (or increase quantity if it already exists)
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    res.status(400);
    throw new Error("Please provide a valid productId and quantity");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units of "${product.name}" left in stock`);
  }

  const cart = await getOrCreateCart(req.user._id);

  // Check if this product is already in the cart.
  // .find() on a plain array searches sub-documents by field value.
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // Already in cart - just bump the quantity.
    existingItem.quantity += Number(quantity);
  } else {
    // New item - push a snapshot of the product's current details.
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: Number(quantity),
    });
  }

  await cart.save();
  res.status(200).json(cart);
});

// @desc    Update the quantity of a specific cart item
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // .id() is a special Mongoose helper for finding a sub-document
  // inside an array by its _id - much cleaner than manually looping.
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  const product = await Product.findById(item.product);
  if (product && product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units left in stock`);
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json(cart);
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Filter out the item whose _id matches the URL param, keep everything else.
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();
  res.status(200).json(cart);
});

// @desc    Clear the entire cart (used after successful checkout)
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.status(200).json({ message: "Cart cleared" });
});
