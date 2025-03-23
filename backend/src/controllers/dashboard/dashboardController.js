import Product from "../../models/products/productModel.js";
import Customer from "../../models/customers/customerModel.js";
import Sales from "../../models/sales/salesModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalSales = await Sales.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalProducts,
      totalCustomers,
      totalSales: totalSales.length ? totalSales[0].totalAmount : 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
