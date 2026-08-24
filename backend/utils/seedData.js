import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();
await connectDB();

const seedData = async () => {
  try {
    // Wipe existing data so this script can be run repeatedly during development.
    await User.deleteMany();
    await Product.deleteMany();

    // Note: we don't hash this manually - the pre('save') hook on the
    // User model does it automatically when we call User.create().
    const admin = await User.create({
      name: "Veeresh_admin",
      email: "veereshshegaji714@gmail.com",
      password: "Veeresh123",
      role: "admin",
    });

    // Prices are in INR (₹) now. Images point at the placeholder SVGs that
    // ship in backend/uploads/products/ - real files that actually exist
    // on disk, so they render immediately instead of showing broken icons.
    const sampleProducts = [
      {
        name: "Classic Running Shoes",
        description: "Lightweight running shoes with breathable mesh upper and cushioned sole.",
        price: 4999,
        category: "Footwear",
        brand: "SprintX",
        stock: 25,
        image: "/uploads/products/shoe.png",
        createdBy: admin._id,
      },
      {
        name: "Wireless Bluetooth Headphones",
        description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
        price: 7499,
        category: "Electronics",
        brand: "SoundWave",
        stock: 40,
        image: "/uploads/products/headphones.png",
        createdBy: admin._id,
      },
      {
        name: "Cotton Crew Neck T-Shirt",
        description: "Soft, breathable 100% cotton t-shirt, available in multiple colors.",
        price: 1299,
        category: "Clothing",
        brand: "BasicWear",
        stock: 100,
        image: "/uploads/products/tshirt.png",
        createdBy: admin._id,
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Insulated water bottle that keeps drinks cold for 24 hours or hot for 12.",
        price: 1999,
        category: "Accessories",
        brand: "HydroLife",
        stock: 60,
        image: "/uploads/products/bottle.png",
        createdBy: admin._id,
      },
      {
        name: "Mechanical Gaming Keyboard",
        description: "RGB backlit mechanical keyboard with tactile switches for gaming and typing.",
        price: 6299,
        category: "Electronics",
        brand: "KeyForce",
        stock: 15,
        image: "/uploads/products/keyboard.png",
        createdBy: admin._id,
      },
      {
        name: "Leather Wallet",
        description: "Genuine leather bifold wallet with RFID-blocking technology.",
        price: 2899,
        category: "Accessories",
        brand: "UrbanCraft",
        stock: 50,
        image: "/uploads/products/wallet.png",
        createdBy: admin._id,
      },
    ];

    await Product.insertMany(sampleProducts);

    console.log("✅ Seed data imported successfully!");
    console.log("   Admin login -> email: admin@example.com | password: admin123");
    process.exit();
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
