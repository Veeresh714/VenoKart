import crypto from "crypto";
// import razorpay from "../config/razorpay.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { calculateOrderAmounts } from "../utils/pricing.js";

// @desc    Create a Razorpay Order for the user's cart
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Re-check stock right before payment - prevents a race condition where
  // someone else buys the last unit while this user was browsing their cart.
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`"${item.name}" is no longer available in that quantity`);
    }
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderAmounts(cart.items);

  // Razorpay expects amount in the SMALLEST currency unit - paise for INR
  // (1 rupee = 100 paise), same idea as cents for USD.
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalPrice * 100),
    currency: "INR",
    // "receipt" is just OUR OWN reference string for this order, shown
    // in the Razorpay dashboard - doesn't need to be unique to Razorpay,
    // but should be unique on our side.
    receipt: `receipt_${req.user._id}_${Date.now()}`,
    // "notes" is a small key-value bag Razorpay stores alongside the
    // order and returns to us later - exactly like Stripe's "metadata".
    // We stash the shipping address and price breakdown here so we can
    // rebuild the order after payment succeeds, without trusting
    // whatever the frontend sends us.
    notes: {
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(shippingAddress),
      itemsPrice: itemsPrice.toString(),
      shippingPrice: shippingPrice.toString(),
      taxPrice: taxPrice.toString(),
      totalPrice: totalPrice.toString(),
    },
  });

  res.status(200).json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID, // safe to expose - it's the PUBLIC key
  });
});

// @desc    Verify a Razorpay payment and create the Order in our database
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing payment verification details");
  }

  // ---------------------------------------------------------
  // THE CRYPTOGRAPHIC SIGNATURE CHECK
  // ---------------------------------------------------------
  // Razorpay signs "order_id|payment_id" using HMAC-SHA256 with OUR
  // secret key, and sends us the result as razorpay_signature. We
  // repeat that exact same calculation here. If our result matches
  // what Razorpay sent, we know for certain:
  //   1. This payment genuinely came from Razorpay (they know our secret)
  //   2. Nobody tampered with the order_id or payment_id in transit
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // crypto.timingSafeEqual compares two strings in constant time,
  // regardless of where they first differ. A plain "===" comparison
  // can leak timing information that (in theory) helps an attacker
  // guess the correct signature byte-by-byte. Buffers must be equal
  // length for timingSafeEqual, so we check that first.
  const isValidSignature =
    generatedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

  if (!isValidSignature) {
    res.status(400);
    throw new Error("Payment verification failed - invalid signature");
  }

  // Prevent creating a duplicate order if this endpoint is somehow called twice.
  const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (existingOrder) {
    return res.status(200).json(existingOrder);
  }

  // Fetch the order back from Razorpay's server (not from the request
  // body) so we read the shipping address / prices we trust, rather
  // than whatever a malicious client might try to send us directly.
  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
  const notes = razorpayOrder.notes;
  const shippingAddress = JSON.parse(notes.shippingAddress);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart not found - cannot finalize order");
  }

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
    paymentMethod: "Razorpay",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    itemsPrice: Number(notes.itemsPrice),
    shippingPrice: Number(notes.shippingPrice),
    taxPrice: Number(notes.taxPrice),
    totalPrice: Number(notes.totalPrice),
    isPaid: true,
    paidAt: new Date(),
    status: "Processing",
  });

  // Reduce stock for each purchased product now that payment is confirmed.
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }, // $inc atomically decreases the field
    });
  }

  // Empty the user's cart now that checkout is complete.
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});
