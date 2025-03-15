import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products/productRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import categoryRoutes from "./routes/products/categoryRoutes.js";
import customerRoutes from "./routes/customers/customerRoutes.js";
import salesRoutes from "./routes/sales/salesRoutes.js";
// Import category routes
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve uploaded images

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Use category routes
app.use("/api/products/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use(errorHandler);

export default app;
