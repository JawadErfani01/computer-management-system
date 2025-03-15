// models/Sale.js
import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtSale: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
