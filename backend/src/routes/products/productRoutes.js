import express from "express";

import upload from "../../middleware/uploadMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  searchProduct,
  updateProduct,
} from "../../controllers/products/productController.js";

const router = express.Router();

router.get("/search", searchProduct);
router.route("/").post(upload.single("image"), createProduct).get(getProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
