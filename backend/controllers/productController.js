import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

// @desc    Get all products (supports search, category filter, pagination)
// @route   GET /api/products?keyword=shoe&category=Footwear&page=1
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 8;
  const page = Number(req.query.page) || 1;

  // Build a dynamic MongoDB filter object based on which query params
  // the client actually sent. This is a very common REST API pattern.
  const filter = {};

  // $text search only works if we call it with $search; it uses the
  // text index we defined on the Product schema.
  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }

  // Filter by exact category match, case-insensitive using regex.
  if (req.query.category && req.query.category !== "All") {
    filter.category = { $regex: `^${req.query.category}$`, $options: "i" };
  }

  // Optional price range filtering.
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // countDocuments tells us the TOTAL number of matching products,
  // so the frontend can render correct pagination controls
  // (e.g. "Page 1 of 5") even though we only fetch one page at a time.
  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1)) // skip previous pages' worth of results
    .sort({ createdAt: -1 }); // newest products first

  res.status(200).json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(product);
});

// @desc    Get list of distinct categories (for filter dropdown)
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  // distinct() returns unique values for a field across the collection.
  const categories = await Product.distinct("category");
  res.status(200).json(categories);
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, stock } = req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // If an image file was uploaded (via multer), req.file will exist.
  // We build a relative URL path to store in the DB.
  const image = req.file
    ? `/uploads/products/${req.file.filename}`
    : undefined;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    stock,
    ...(image && { image }), // only override default image if one was uploaded
    createdBy: req.user._id, // req.user comes from the "protect" middleware
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { name, description, price, category, brand, stock } = req.body;

  // Update only the fields that were actually provided in the request.
  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  product.brand = brand ?? product.brand;
  product.stock = stock ?? product.stock;

  // If a new image was uploaded, replace the old path.
  if (req.file) {
    product.image = `/uploads/products/${req.file.filename}`;
  }

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // deleteOne() on the document instance removes it from MongoDB.
  await product.deleteOne();

  res.status(200).json({ message: "Product removed successfully" });
});
