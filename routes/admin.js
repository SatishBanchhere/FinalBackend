const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const JWT_SECRET = process.env.SECRET_KEY; // Replace with a strong secret key
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

router.get('/summary', async (req, res) => {
  try {
    // Get the total number of products
    const productCount = await Product.countDocuments();

    // Get the total number of users
    const userCount = await User.countDocuments();

    // Respond with both counts
    res.json({ products: productCount, users: userCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
});

// Create a new product
router.post("/product", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a product
router.put("/product/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).send("Product not found");
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/toggle-product-approval", async (req, res) => {
  const { token, productId } = req.body;
  // Check if token and productId are provided
  if (!token || !productId) {
    return res
      .status(400)
      .json({ message: "Token and productId are required" });
  }

  try {
    // Verify the token and get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the userRole is superAdmin
    console.log(user); // Log the entire user object
    console.log("User Role:", user.userRole); // Log the userRole explicitly

    if (user.userRole !== "superAdmin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }

    // Find the product by ID
    const product = await Product.findById(productId);
    console.log(product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Toggle the approval status
    product.isApproved = !product.isApproved;
    await product.save();

    res.status(200).json({
      message: `Product ${
        product.isApproved ? "approved" : "unapproved"
      } successfully`,
      product,
    });
  } catch (error) {
    console.error("Error toggling product approval:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const isSuperAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user.userRole === "superAdmin") {
    next();
    console.log("Mai toh de raha jaane");
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

const authenticateToken = async (req, res, next) => {
  const { token } = req.body; // Bearer TOKEN

  if (token == null) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    // Optionally, you can fetch the user from the database to attach user details
    const userId = user.id;
    const userAhe = await User.findById(userId);
    if (!userAhe) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = userAhe;
    next();
  });
};

router.put(
  "/change-user-role",
  authenticateToken,
  isSuperAdmin,
  async (req, res) => {
    const { userId, newRole } = req.body;
    console.log("userId");
    if (!["user", "admin"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.userRole = newRole;
      await user.save();

      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete a product
router.delete("/product/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.send({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Show all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
