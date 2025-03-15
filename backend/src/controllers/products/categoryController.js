import mongoose from "mongoose";
import Category from "../../models/products/categoryModel.js";

// @desc    Get all categories
// @route   GET /api/products/category
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/products/category
// @access  Public
export const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name: categoryName,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    delete a category
// @route   DELETE /api/products/category/:id
// @access  Public
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update a category
// @route   PUT /api/products/category/:id
// @access  Public
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body; // ✅ Extract correctly

    console.log("Updating category:", id, categoryName);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Ensure category name is provided
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Find the category and update it
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name: categoryName }, // ✅ Correct field update
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Server error" });
  }
};
