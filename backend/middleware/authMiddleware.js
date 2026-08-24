import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware functions in Express have the signature (req, res, next).
// "next()" tells Express "I'm done, move on to the next function in line"
// (either another middleware, or the actual route controller).

// PROTECT: verifies the user is logged in (has a valid JWT).
export const protect = async (req, res, next) => {
  let token;

  // Standard convention: JWT is sent in the "Authorization" header as:
  // Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Split "Bearer xxxxx.yyyyy.zzzzz" and take the token part.
      token = req.headers.authorization.split(" ")[1];

      // jwt.verify checks the signature using our secret.
      // If the token was tampered with or expired, this THROWS an error,
      // which is caught below.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded.id is the userId we embedded when creating the token.
      // We fetch the fresh user from DB (excluding password) and attach
      // it to req.user, so every controller after this can access
      // "who is making this request" via req.user.
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      next(); // ✅ token valid, continue to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// ADMIN: must be used AFTER "protect", since it relies on req.user existing.
// Restricts a route to admin users only (e.g., add/edit/delete products).
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
