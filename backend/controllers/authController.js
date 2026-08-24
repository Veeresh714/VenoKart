import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic manual validation (Mongoose schema validation runs too,
  // but checking early lets us return friendly errors fast, before
  // even touching the database).
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }

  // Check if a user with this email already exists.
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  // Create the user. Note: we do NOT hash the password here —
  // remember the pre('save') hook in User.js does that automatically.
  const user = await User.create({ name, email, password });

  // Generate a JWT so the user is immediately logged in after registering.
  const token = generateToken(user._id);

  // 201 = "Created". We send back user info (never the password!) + token.
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Remember: password has "select: false" in the schema, so by default
  // it's excluded from query results. We explicitly add it back here
  // with .select("+password") because we NEED it to compare below.
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // We deliberately give the SAME error message whether the email doesn't
  // exist OR the password is wrong. If we said "email not found" vs
  // "wrong password" separately, attackers could figure out which emails
  // are registered (a security leak called "user enumeration").
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private (requires valid JWT)
export const getUserProfile = asyncHandler(async (req, res) => {
  // req.user was attached by the "protect" middleware after verifying the JWT.
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
  });
});

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // For each field, use the new value if provided, otherwise keep the old one.
  // This pattern (?? or ||) allows PARTIAL updates - the client doesn't have
  // to resend every field, just the ones that changed.
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  if (req.body.address) {
    // Merge new address fields with existing ones (so partial address
    // updates, like changing only the city, don't wipe out other fields).
    user.address = { ...user.address, ...req.body.address };
  }

  // If the user wants to change their password too.
  if (req.body.password) {
    user.password = req.body.password; // pre('save') hook will hash it
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address,
  });
});
