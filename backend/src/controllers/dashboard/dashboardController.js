import Product from "../../models/products/productModel.js";
import Customer from "../../models/customers/customerModel.js";
import Sales from "../../models/sales/salesModel.js";
import moment from "moment"; // For date formatting

export const getDashboardStats = async (req, res) => {
  try {
    // Get real counts from the database
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Aggregate real sales data by month
    const salesByMonth = await Sales.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract month from sales' createdAt date
          year: { $year: "$createdAt" }, // Extract year from sales' createdAt date
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }, // Sort by year and month in descending order
      },
    ]);

    // Prepare data for frontend chart
    const months = [];
    const salesData = [];
    const productData = [];
    const customerData = [];

    // Get the last 6 months
    for (let i = 5; i >= 0; i--) {
      const currentDate = moment().subtract(i, "months");
      const year = currentDate.year();
      const month = currentDate.month() + 1; // MongoDB months are 1-based (January = 1)

      const salesForMonth = salesByMonth.find(
        (item) => item._id.year === year && item._id.month === month
      );
      salesData.push(salesForMonth ? salesForMonth.totalSales : 0);

      // Collect labels for months
      months.push(currentDate.format("MMMM YYYY")); // Format month (e.g., "January 2023")

      // Generate data for product and customer (you can aggregate this if needed)
      productData.push(totalProducts); // Total products (this can be improved to show product stats by month)
      customerData.push(totalCustomers); // Total customers (this can be improved to show customer stats by month)
    }

    res.json({
      months, // Array of months
      salesData, // Array of sales for each month
      productData, // Array of product counts for each month
      customerData, // Array of customer counts for each month
      totalProducts, // Total products (overall)
      totalCustomers, // Total customers (overall)
      totalSales: salesData.reduce((acc, curr) => acc + curr, 0), // Sum of all sales for a total
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
