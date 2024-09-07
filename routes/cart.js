const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel'); // Ensure this model exists
const mongoose = require('mongoose');
const User = require('../models/userModel');

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
    console.log("Ye hai user");
    console.log(user);
    req.userId = user.id; // Assuming token payload contains user ID
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
// router.post('/details', authenticateToken, async (req, res) => {
//   try {
//     console.log("Details endpoint hit");

//     const userId = req.userId;

//     // Fetch the cart with populated product details
//     const cart = await Cart.findOne({ userId }).populate({
//       path: 'products.productId',
//       select: 'name price thumbnail link', // Select only the necessary fields
//     });

//     if (!cart) return res.status(404).send('Cart not found');

//     // Fetch the user to get the discount
//     const user = await User.findById(userId).select('discount');
//     if (!user) return res.status(404).send('User not found');

//     // Get the user's discount, default to 0 if not set
//     const discount = user.discount || 0;

//     // Map cart items to include necessary product details
//     const cartItemsWithDetails = cart.products.map(item => {
//       const product = item.productId;
//       console.log(product);
//       return {
//         productId: product.id,
//         quantity: item.quantity,
//         name: product.name,
//         price: product.price,
//         thumbnail: product.thumbnail,
//         link: product.link,
//         // Add any other necessary fields here
//       };
//     });

//     // Send cart items and discount
//     res.status(200).send({ cartItems: cartItemsWithDetails, discount });
//   } catch (error) {
//     console.error(error);
//     res.status(400).send(error.message);
//   }
// });


router.post('/details', authenticateToken, async (req, res) => {
  try {
    console.log("Details madhe tar aala");
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    const user = await User.findById(userId); // Assuming you have a User model

    if (!cart) return res.status(404).send('Cart not found');

    // Get the user's discount
    const discount = user ? user.discount || 0 : 0;

    // Map cart items to include product details
    const cartItemsWithDetails = await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.productId);
        return { ...item._doc, productDetails: product };
      })
    );
    console.log(cartItemsWithDetails);
    // Send cart items and discount
    res.status(200).send({ cartItems: cartItemsWithDetails, discount });
  } catch (error) {
    console.log(error);
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
      console.log(productId)
      console.log(quantity)
      return res.status(400).send('Product ID and quantity are required');
    }
    
    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).send('Cart not found');
    }
    
    // Find the product in the cart
    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    console.log(productId)
    console.log("All product IDs in the cart:", cart.products.map(p => p.productId.toString()));
    console.log(productIndex)
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
