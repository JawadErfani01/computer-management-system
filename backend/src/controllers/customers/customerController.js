import Customer from "../../models/customers/customerModel.js";

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, country } = req.body;

    // Trim inputs to prevent unnecessary spaces
    const trimmedEmail = email?.trim();
    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedAddress = address?.trim();
    const trimmedCity = city?.trim();
    const trimmedCountry = country?.trim();

    // Validate required fields
    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !trimmedAddress ||
      !trimmedCity ||
      !trimmedCountry
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: trimmedEmail });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new customer
    const newCustomer = new Customer({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
      city: trimmedCity,
      country: trimmedCountry,
    });

    await newCustomer.save();

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res
      .status(500)
      .json({ message: "Error creating customer", error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

// Update customer details
export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};
