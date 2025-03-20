// controllers/salesController.js
import Sale from "../../models/sales/salesModel.js";
import Product from "../../models/products/productModel.js";
import Customer from "../../models/customers/customerModel.js";

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
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales" });
  }
};

// READ: Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name email")
      .populate("products.product", "name price");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sale" });
  }
};

const updateSale = async (req, res) => {
  try {
    const { customer, products, totalAmount, saleDate } = req.body; // Destructure the correct fields

    // Ensure that saleDate is parsed correctly
    const parsedSaleDate = isNaN(Date.parse(saleDate))
      ? new Date()
      : new Date(saleDate);
    if (isNaN(parsedSaleDate)) {
      return res.status(400).json({ message: "Invalid sale date" });
    }

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    let calculatedTotalAmount = 0;

    // Update product stock and calculate total amount for the sale
    const productUpdates = products.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Ensure the stock is sufficient
      if (product.stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      // Update the product stock
      product.stock -= quantity;
      await product.save();

      // Accumulate the total amount
      calculatedTotalAmount += product.price * quantity;

      return {
        product: productId, // Use the productId here
        quantity,
        priceAtSale: product.price,
      };
    });

    // Wait for all product updates to complete
    const productsWithDetails = await Promise.all(productUpdates);

    // Update the sale record with new data
    sale.customer = customer; // Ensure this is converted to ObjectId
    sale.products = productsWithDetails;
    sale.totalAmount = calculatedTotalAmount; // Update total amount after all product updates
    sale.saleDate = parsedSaleDate; // Use parsed date for sale date

    await sale.save();
    res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(400).json({ message: error.message });
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

export { createSale, getSales, getSaleById, updateSale, deleteSale };
