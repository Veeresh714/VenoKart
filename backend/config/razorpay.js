import Razorpay from "razorpay";

// Initialize the Razorpay client using our key ID + secret from .env.
// key_id is public (safe to expose to the frontend too), key_secret is
// private and must NEVER leave the backend - it's used to sign/verify
// payments, similar in spirit to our JWT_SECRET.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
