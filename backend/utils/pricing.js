// Shared pricing rules - kept in ONE place so a Cash on Delivery order
// and a Razorpay-paid order always compute totals the exact same way.
// If these numbers ever need to change (e.g. a new tax rate), this is
// the only file that needs editing.
export const FREE_SHIPPING_THRESHOLD = 999; // ₹999
export const SHIPPING_FEE = 49; // ₹49
export const TAX_RATE = 0.05; // 5%

export const calculateOrderAmounts = (cartItems) => {
  const itemsPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};
