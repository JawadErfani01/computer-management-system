// controllers/salesController.js
import Sale from "../../models/sales/salesModel.js";
import Product from "../../models/products/productModel.js";
import Customer from "../../models/customers/customerModel.js";

import moment from "moment-jalaali";
// CREATE: Create a new sale
const createSale = async (req, res) => {
  try {
    const { customerId, products } = req.body;
    console.log(req.body);
    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let totalAmount = 0;

    // Update product stock and calculate total
    const productUpdates = products.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      // Update the product stock
      product.stock -= quantity;
      await product.save();

      totalAmount += product.price * quantity;

      return {
        product: productId,
        quantity,
        priceAtSale: product.price,
      };
    });

    // Wait for all product updates to complete
    const productsWithDetails = await Promise.all(productUpdates);

    // Create the sale record
    const sale = new Sale({
      customer: customerId,
      products: productsWithDetails,
      totalAmount,
    });
    await sale.save();
    res.status(201).json({ message: "Sale created successfully", sale });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ: Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name email")
      .populate("products.product", "name price");

    // Convert saleDate from Gregorian to Jalali before sending it to the frontend
    const salesWithJalaliDate = sales.map((sale) => ({
      ...sale._doc,
      saleDate: sale.saleDate
        ? moment(sale.saleDate).format("jYYYY/jMM/jDD")
        : null,
    }));

    res.status(200).json(salesWithJalaliDate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales" });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name email")
      .populate("products.product", "name price");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Convert saleDate from Gregorian to Jalali before sending it
    const saleWithJalaliDate = {
      ...sale._doc,
      saleDate: sale.saleDate
        ? moment(sale.saleDate).format("jYYYY/jMM/jDD")
        : null,
    };

    res.status(200).json(saleWithJalaliDate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sale" });
  }
};

// DELETE: Delete a sale
const deleteSale = async (req, res) => {
  console.log(req.params.id);
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Restore the product stock if necessary (this can be customized)
    // for (let item of sale.products) {
    //   const product = await Product.findById(item.product);
    //   if (product) {
    //     product.stock += item.quantity;
    //     await product.save();
    //   }
    // }

    await Sale.findByIdAndDelete(req.params.id); // Use findByIdAndDelete here
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sale" });
  }
};

const updateSale = async (req, res) => {
  try {
    const { customer, products, saleDate } = req.body; // Get the Jalali date from frontend

    // ✅ Convert Jalali date to Gregorian
    const parsedSaleDate = moment(saleDate, "jYYYY/jMM/jDD").format(
      "YYYY-MM-DD"
    );

    // ✅ Ensure parsedSaleDate is valid
    if (!moment(parsedSaleDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ message: "Invalid sale date format" });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    let calculatedTotalAmount = 0;

    // **Step 1: Restore Stock for Removed Products**
    for (const prevProduct of sale.products) {
      const product = await Product.findById(prevProduct.product);
      if (product) {
        product.stock += prevProduct.quantity; // Restore previous stock
        await product.save();
      }
    }

    // **Step 2: Update Stock for New Products**
    const productUpdates = products.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Ensure the stock is sufficient
      if (product.stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      // Deduct the new quantity from stock
      product.stock -= quantity;

      // **Step 3: If stock is zero, delete the product**
      if (product.stock === 0) {
        await Product.findByIdAndDelete(productId);
      } else {
        await product.save();
      }

      // Accumulate the total amount
      calculatedTotalAmount += product.price * quantity;

      return {
        product: productId,
        quantity,
        priceAtSale: product.price,
      };
    });

    // Wait for all product updates to complete
    const productsWithDetails = await Promise.all(productUpdates);

    // **Step 4: Update the sale record with new data**
    sale.customer = customer;
    sale.products = productsWithDetails;
    sale.totalAmount = calculatedTotalAmount;
    sale.saleDate = new Date(parsedSaleDate); // ✅ Store Gregorian date in the database

    await sale.save();
    res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(400).json({ message: error.message });
  }
};

export { createSale, getSales, getSaleById, updateSale, deleteSale };
