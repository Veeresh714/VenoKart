import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();
await connectDB();

const seedProducts = async () => {
  try {
    // Find existing admin
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("❌ No admin user found.");
      console.log("Please create an admin user first.");
      process.exit(1);
    }

    const products = [
      {
        name: "Apple iPhone 15",
        description: "6.1-inch smartphone with A16 Bionic chip and advanced dual camera system.",
        price: 69999,
        category: "Mobiles",
        brand: "Apple",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Samsung Galaxy S24",
        description: "Premium Android smartphone with Dynamic AMOLED display and powerful processor.",
        price: 74999,
        category: "Mobiles",
        brand: "Samsung",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "OnePlus 12",
        description: "Flagship smartphone with high refresh rate display and fast charging.",
        price: 64999,
        category: "Mobiles",
        brand: "OnePlus",
        stock: 30,
        createdBy: admin._id
      },
      {
        name: "Google Pixel 9",
        description: "AI-powered smartphone with excellent camera and clean Android experience.",
        price: 79999,
        category: "Mobiles",
        brand: "Google",
        stock: 18,
        createdBy: admin._id
      },
      {
        name: "Nothing Phone 2",
        description: "Modern smartphone featuring Glyph interface and smooth OLED display.",
        price: 39999,
        category: "Mobiles",
        brand: "Nothing",
        stock: 35,
        createdBy: admin._id
      },
      {
        name: "Redmi Note 14 Pro",
        description: "Affordable smartphone with AMOLED display, powerful processor and large battery.",
        price: 27999,
        category: "Mobiles",
        brand: "Redmi",
        stock: 45,
        createdBy: admin._id
      },
      {
        name: "Realme GT 6",
        description: "Performance-focused smartphone with fast processor and high refresh rate display.",
        price: 39999,
        category: "Mobiles",
        brand: "Realme",
        stock: 28,
        createdBy: admin._id
      },
      {
        name: "Motorola Edge 50",
        description: "Stylish smartphone with curved display and powerful camera system.",
        price: 32999,
        category: "Mobiles",
        brand: "Motorola",
        stock: 32,
        createdBy: admin._id
      },

      {
        name: "HP Pavilion 15",
        description: "Versatile laptop suitable for students, office work and everyday computing.",
        price: 62999,
        category: "Laptops",
        brand: "HP",
        stock: 15,
        createdBy: admin._id
      },
      {
        name: "Dell Inspiron 15",
        description: "Reliable laptop with excellent performance for productivity and entertainment.",
        price: 58999,
        category: "Laptops",
        brand: "Dell",
        stock: 18,
        createdBy: admin._id
      },
      {
        name: "Lenovo IdeaPad Slim 5",
        description: "Slim and lightweight laptop designed for students and professionals.",
        price: 64999,
        category: "Laptops",
        brand: "Lenovo",
        stock: 22,
        createdBy: admin._id
      },
      {
        name: "ASUS VivoBook 15",
        description: "Slim laptop with vibrant display and efficient everyday performance.",
        price: 54999,
        category: "Laptops",
        brand: "ASUS",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "Acer Aspire 5",
        description: "Affordable productivity laptop with strong performance and expandable storage.",
        price: 49999,
        category: "Laptops",
        brand: "Acer",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Apple MacBook Air M3",
        description: "Lightweight laptop powered by Apple M3 chip with long battery life.",
        price: 109999,
        category: "Laptops",
        brand: "Apple",
        stock: 10,
        createdBy: admin._id
      },
      {
        name: "ASUS ROG Gaming Laptop",
        description: "High-performance gaming laptop with dedicated graphics and high refresh rate display.",
        price: 119999,
        category: "Laptops",
        brand: "ASUS",
        stock: 8,
        createdBy: admin._id
      },

      {
        name: "Sony WH-1000XM5",
        description: "Premium wireless headphones with advanced noise cancellation.",
        price: 29999,
        category: "Audio",
        brand: "Sony",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Apple AirPods Pro 2",
        description: "Wireless earbuds with active noise cancellation and spatial audio.",
        price: 24999,
        category: "Audio",
        brand: "Apple",
        stock: 30,
        createdBy: admin._id
      },
      {
        name: "Samsung Galaxy Buds 3",
        description: "Wireless earbuds with clear sound and active noise cancellation.",
        price: 14999,
        category: "Audio",
        brand: "Samsung",
        stock: 35,
        createdBy: admin._id
      },
      {
        name: "OnePlus Buds 3",
        description: "Wireless earbuds with powerful bass and noise cancellation.",
        price: 5499,
        category: "Audio",
        brand: "OnePlus",
        stock: 50,
        createdBy: admin._id
      },
      {
        name: "JBL Tune 770NC",
        description: "Wireless over-ear headphones with adaptive noise cancellation.",
        price: 6999,
        category: "Audio",
        brand: "JBL",
        stock: 40,
        createdBy: admin._id
      },
      {
        name: "Boat Rockerz 450",
        description: "Affordable wireless headphones with powerful bass.",
        price: 1499,
        category: "Audio",
        brand: "Boat",
        stock: 60,
        createdBy: admin._id
      },
      {
        name: "JBL Flip 6",
        description: "Portable Bluetooth speaker with powerful sound and water-resistant design.",
        price: 9999,
        category: "Audio",
        brand: "JBL",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Sony SRS-XB100",
        description: "Compact portable Bluetooth speaker with clear sound.",
        price: 4999,
        category: "Audio",
        brand: "Sony",
        stock: 35,
        createdBy: admin._id
      },

      {
        name: "Apple Watch Series 10",
        description: "Advanced smartwatch with fitness tracking and notifications.",
        price: 46999,
        category: "Smartwatches",
        brand: "Apple",
        stock: 15,
        createdBy: admin._id
      },
      {
        name: "Samsung Galaxy Watch 7",
        description: "Premium smartwatch with fitness tracking and health monitoring.",
        price: 29999,
        category: "Smartwatches",
        brand: "Samsung",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "OnePlus Watch 2",
        description: "Long-lasting smartwatch with fitness tracking and Wear OS.",
        price: 24999,
        category: "Smartwatches",
        brand: "OnePlus",
        stock: 22,
        createdBy: admin._id
      },
      {
        name: "Noise ColorFit Pro",
        description: "Affordable smartwatch with AMOLED display and fitness modes.",
        price: 3999,
        category: "Smartwatches",
        brand: "Noise",
        stock: 50,
        createdBy: admin._id
      },
      {
        name: "Boat Wave Sigma",
        description: "Budget smartwatch with large display and health monitoring.",
        price: 1999,
        category: "Smartwatches",
        brand: "Boat",
        stock: 55,
        createdBy: admin._id
      },

      {
        name: "Logitech MX Master 3S",
        description: "Premium wireless mouse designed for productivity.",
        price: 8999,
        category: "Accessories",
        brand: "Logitech",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "Logitech K380 Keyboard",
        description: "Compact wireless keyboard with multi-device connectivity.",
        price: 2999,
        category: "Accessories",
        brand: "Logitech",
        stock: 35,
        createdBy: admin._id
      },
      {
        name: "HP Wireless Keyboard Mouse",
        description: "Wireless keyboard and mouse combo for everyday computing.",
        price: 1799,
        category: "Accessories",
        brand: "HP",
        stock: 45,
        createdBy: admin._id
      },
      {
        name: "Mi Power Bank 20000mAh",
        description: "High-capacity power bank with fast charging support.",
        price: 1999,
        category: "Accessories",
        brand: "Xiaomi",
        stock: 50,
        createdBy: admin._id
      },
      {
        name: "Anker PowerCore 20000",
        description: "Portable high-capacity power bank with reliable fast charging.",
        price: 2999,
        category: "Accessories",
        brand: "Anker",
        stock: 30,
        createdBy: admin._id
      },
      {
        name: "Apple 20W USB-C Adapter",
        description: "Compact USB-C power adapter for fast charging.",
        price: 1999,
        category: "Accessories",
        brand: "Apple",
        stock: 45,
        createdBy: admin._id
      },
      {
        name: "Samsung 25W Fast Charger",
        description: "USB-C fast charger for compatible Samsung devices.",
        price: 1299,
        category: "Accessories",
        brand: "Samsung",
        stock: 55,
        createdBy: admin._id
      },

      {
        name: "SanDisk 1TB Portable SSD",
        description: "High-speed portable SSD for backups and large file transfers.",
        price: 7999,
        category: "Storage",
        brand: "SanDisk",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Samsung 1TB Portable SSD",
        description: "Fast and compact external SSD for data storage and transfer.",
        price: 8999,
        category: "Storage",
        brand: "Samsung",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "WD 1TB External HDD",
        description: "Portable external hard drive for files and backups.",
        price: 4999,
        category: "Storage",
        brand: "Western Digital",
        stock: 30,
        createdBy: admin._id
      },
      {
        name: "SanDisk 128GB Pendrive",
        description: "Compact USB flash drive for everyday file storage.",
        price: 999,
        category: "Storage",
        brand: "SanDisk",
        stock: 70,
        createdBy: admin._id
      },

      {
        name: "TP-Link WiFi Router",
        description: "Dual-band wireless router for fast home connectivity.",
        price: 2499,
        category: "Networking",
        brand: "TP-Link",
        stock: 40,
        createdBy: admin._id
      },
      {
        name: "D-Link WiFi Router",
        description: "Reliable dual-band router for home and small offices.",
        price: 2199,
        category: "Networking",
        brand: "D-Link",
        stock: 35,
        createdBy: admin._id
      },

      {
        name: "Amazon Echo Dot",
        description: "Compact smart speaker with voice assistant.",
        price: 5499,
        category: "Smart Home",
        brand: "Amazon",
        stock: 25,
        createdBy: admin._id
      },
      {
        name: "Google Nest Mini",
        description: "Compact smart speaker for music and smart home control.",
        price: 4499,
        category: "Smart Home",
        brand: "Google",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "Philips LED Smart Bulb",
        description: "Smart LED bulb with adjustable brightness and app controls.",
        price: 999,
        category: "Smart Home",
        brand: "Philips",
        stock: 60,
        createdBy: admin._id
      },
      {
        name: "Mi Smart LED Bulb",
        description: "WiFi-enabled smart bulb with adjustable colors and brightness.",
        price: 799,
        category: "Smart Home",
        brand: "Xiaomi",
        stock: 65,
        createdBy: admin._id
      },

      {
        name: "HP 24-inch Monitor",
        description: "Full HD monitor suitable for office work and entertainment.",
        price: 11999,
        category: "Monitors",
        brand: "HP",
        stock: 18,
        createdBy: admin._id
      },
      {
        name: "LG 27-inch Monitor",
        description: "27-inch Full HD monitor with vibrant colors.",
        price: 15999,
        category: "Monitors",
        brand: "LG",
        stock: 15,
        createdBy: admin._id
      },
      {
        name: "Samsung 24-inch Monitor",
        description: "Slim Full HD monitor designed for productivity.",
        price: 12999,
        category: "Monitors",
        brand: "Samsung",
        stock: 20,
        createdBy: admin._id
      },
      {
        name: "Dell 27-inch Monitor",
        description: "Professional Full HD monitor with slim bezels.",
        price: 17999,
        category: "Monitors",
        brand: "Dell",
        stock: 12,
        createdBy: admin._id
      }
    ];

    await Product.insertMany(products);

    console.log(`✅ ${products.length} products added successfully!`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedProducts();