import express from "express";
import { getDashboardStats } from "../../controllers/dashboard/dashboardController.js";

const router = express.Router();

router.get("/", getDashboardStats);

export default router;
