import jwt from "jsonwebtoken";

// This function creates a signed JWT (JSON Web Token) containing the user's ID.
// The token is like a "digital ID card" the client will send with every
// future request to prove who they are, without needing to log in again.
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // payload: data we want to embed inside the token
    process.env.JWT_SECRET, // secret key used to "sign" the token (prevents tampering)
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // token auto-expires after 7 days
  );
};

export default generateToken;
