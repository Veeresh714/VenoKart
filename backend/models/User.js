import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// A Schema defines the SHAPE of a document: field names, types, and rules.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // removes extra whitespace like "  John " -> "John"
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB will enforce no two users share an email
      lowercase: true, // always store emails in lowercase to avoid duplicates
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // by default, don't return password field in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"], // only these two values are allowed
      default: "user",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    phone: {
      type: String,
      default: "",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields, managed by Mongoose.
    timestamps: true,
  }
);

// ---------------------------------------------------------
// MONGOOSE MIDDLEWARE (a "hook" that runs automatically)
// ---------------------------------------------------------
// "pre('save', ...)" runs this function RIGHT BEFORE a user document is saved.
// We use this to hash the password automatically, so controllers never
// have to remember to do it manually (and can never forget to).
userSchema.pre("save", async function (next) {
  // "this" refers to the user document being saved.
  // Only hash the password if it's new or has been changed.
  // (Otherwise, editing a profile's name would re-hash an already-hashed password!)
  if (!this.isModified("password")) {
    return next();
  }

  // genSalt(10) generates a "salt" - random data mixed into the hash
  // so that two users with the same password get different hashes.
  // 10 is the "cost factor" - higher = more secure but slower. 10 is a good default.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // continue with the save operation
});

// ---------------------------------------------------------
// INSTANCE METHOD
// ---------------------------------------------------------
// This adds a custom method available on every user document,
// e.g. `user.comparePassword("typedPassword")`.
// We use it during login to check the entered password against the stored hash.
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare hashes enteredPassword with the same salt and checks if it matches.
  return await bcrypt.compare(enteredPassword, this.password);
};

// mongoose.model(name, schema) registers this schema as a "User" model,
// which MongoDB will store in a collection called "users" (lowercase, pluralized).
const User = mongoose.model("User", userSchema);

export default User;
