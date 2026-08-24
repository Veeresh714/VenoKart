import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { calculateOrderAmounts } from "../utils/pricing.js";

// @desc    Place a Cash on Delivery order directly (no payment gateway)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  // This endpoint only handles Cash on Delivery. Online payments go
  // through /api/payment/create-order + /api/payment/verify instead,
  // where an Order only gets created AFTER Razorpay confirms payment.
  // Keeping the two flows separate avoids ever creating a half-finished
  // "paid" order from the wrong endpoint.
  if (paymentMethod !== "COD") {
    res.status(400);
    throw new Error(
      "This endpoint only supports Cash on Delivery. Use the online payment flow for card/UPI orders."
    );
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Re-check stock right before placing the order - same reasoning as
  // the online payment flow: prevents overselling if stock changed
  // while this item sat in the user's cart.
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`"${item.name}" is no longer available in that quantity`);
    }
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderAmounts(cart.items);

  const orderItems = cart.items.map((item) => ({
    product: item.product,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: "COD",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: false, // cash is collected on delivery, not now
    status: "Processing",
  });

  // Stock is reserved as soon as the order is PLACED, not when it's
  // paid for - otherwise two different COD customers could "order"
  // the same last unit before either one actually pays.
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// @desc    Get logged-in user's order history
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  // Sort newest first so users see their most recent order at the top.
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json(orders);
});

// @desc    Get a single order's details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  // .populate("user", "name email") fetches the related User document,
  // but only pulls the "name" and "email" fields (saves bandwidth).
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // SECURITY CHECK: a regular user should only be able to view their
  // OWN orders, never someone else's, even if they guess the order ID.
  // Admins are allowed to view any order.
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.status(200).json(order);
});

// @desc    Get ALL orders (admin order management view)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(orders);
});

// @desc    Update order status (e.g. Processing -> Shipped)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  res.status(200).json(order);
});
