import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../controllers/products/categoryController.js";

const router = express.Router();

// Route to create a category
router.post("/", createCategory);

// Route to get all categories
router.get("/", getCategories);

// route to delete a category
router.delete("/:id", deleteCategory);

// Route to update a category
router.put("/:id", updateCategory);

export default router;
