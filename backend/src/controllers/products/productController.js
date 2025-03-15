import Category from "../../models/products/categoryModel.js";
import Product from "../../models/products/productModel.js";
import fs from "fs";

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category, brand, SKU } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!name || !price || !stock || !category || !brand || !SKU || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if the category exists in the database
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    const product = new Product({
      name,
      price,
      stock,
      description,
      category,
      brand,
      image,
      SKU,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category", "name");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle image update if included in request
    const updatedData = { ...req.body };

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true, // Return updated document
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from uploads folder
    if (product.image) {
      fs.unlink(`.${product.image}`, (err) => {
        if (err) console.log("Failed to delete image:", err);
      });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Search products route
export const searchProduct = async (req, res) => {
  const { query } = req.query;

  console.log("Received query:", query);

  if (!query || query.trim() === "") {
    try {
      const products = await Product.find(); // Return all products if no query
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching all products:", error);
      return res.status(500).json({ message: "Error fetching all products" });
    }
  }

  try {
    // Ensure query is a string before performing regex search
    const searchQuery = String(query).trim();

    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { SKU: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error while searching products:", error);
    res.status(500).json({ message: "Error while searching products" });
  }
};
