import mongoose from "mongoose";

// This function connects our Node.js app to MongoDB using Mongoose.
// It's "async" because connecting to a database takes time (it's a network call),
// and we want to wait for it to finish before moving on.
const connectDB = async () => {
  try {
    // mongoose.connect() returns a Promise. We "await" it to pause here
    // until the connection succeeds or fails.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // conn.connection.host tells us which MongoDB server we connected to.
    // Useful for confirming we're pointing at the right database.
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // process.exit(1) stops the entire Node process with a "failure" code.
    // There's no point running a server that can't reach its database.
    process.exit(1);
  }
};

export default connectDB;
