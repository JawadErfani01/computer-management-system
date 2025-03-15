// routes/salesRoutes.js
import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../../controllers/sales/salesController.js";

const router = express.Router();

// Create a sale
router.post("/", createSale);

// Get all sales
router.get("/", getSales);

// Get sale by ID
router.get("/:id", getSaleById);

// Update a sale
router.put("/:id", updateSale);

// Delete a sale
router.delete("/:id", deleteSale);

export default router;
