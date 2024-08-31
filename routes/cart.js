const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel'); // Ensure this model exists
const mongoose = require('mongoose');

// Middleware to extract userId from token in the body
const authenticateToken = (req, res, next) => {

  const { token } = req.body; // Extract token from request body
  
  if (!token) return res.status(401).send('Token is required');
  console.log(token)
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send('Invalid token');
    }
    req.userId = user._id; // Assuming token payload contains user ID
    next();
  });
};

// Add a product to the cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    console.log('Request Body:', req.body);
    console.log('Extracted User ID:', userId);

    if (!userId) {
      return res.status(400).send('User ID is missing');
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("Creating new cart for user:", userId);
      cart = new Cart({ userId, products: [] });
    }

    const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
    console.log("Product Index:", productIndex);

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    console.log("Cart saved successfully");
    res.status(200).send(cart);
  } catch (error) {
    console.log("Error:", error);
    res.status(400).send(error);
  }
});


// Remove all instances of a product from the cart
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    console.log("Thike bhai kata hu remove")
    const { productId } = req.body;
    const userId = req.userId;

    // Find the cart and remove all instances of the product
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true }
    );

    if (!cart) return res.status(404).send('Cart not found');
    res.status(200).send(cart);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all cart items with product details
router.post('/details', authenticateToken, async (req, res) => {
  try {
    console.log("Details madhe tar aala")
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) return res.status(404).send('Cart not found');

    // Map cart items to include product details
    const cartItemsWithDetails = await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.productId);
        return { ...item._doc, productDetails: product };
      })
    );

    res.status(200).send(cartItemsWithDetails);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update quantity of a specific product in the cart
router.post('/update-quantity', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).send('User ID is missing');
    }
    
    if (!productId || quantity === undefined) {
      return res.status(400).send('Product ID and quantity are required');
    }
    
    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).send('Cart not found');
    }
    
    // Find the product in the cart
    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId._id);
    console.log(productId)
    console.log("All product IDs in the cart:", cart.products.map(p => p.productId.toString()));

    if (productIndex > -1) {
      // Update quantity if product already in cart
      cart.products[productIndex].quantity = quantity;
    } else {
      // Product not found, send error message (optional)
      return res.status(400).send('Product not found in cart');
    }

    // Save the updated cart
    await cart.save();

    res.status(200).send(cart);
  } catch (error) {
    console.log("Error:", error);
    res.status(400).send(error);
  }
});



module.exports = router;
