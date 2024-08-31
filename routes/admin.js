const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const JWT_SECRET = process.env.SECRET_KEY; // Replace with a strong secret key
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Create a new product
router.post('/product', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a product
router.put('/product/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).send('Product not found');
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/toggle-product-approval', async (req, res) => {
  const token = req.body.token;
  const productId = req.body.productId;

  if (!token || !productId) {
      return res.status(400).json({ message: 'Token and productId are required' });
  }

  try {
      // Verify the token and get the user ID
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the userRole is superAdmin
      if (user.userRole !== 'superAdmin') {
          return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }

      // Find the product by ID
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Toggle the approval status
      product.isApproved = !product.isApproved;
      await product.save();

      res.status(200).json({ message: `Product ${product.isApproved ? 'approved' : 'unapproved'} successfully`, product });
  } catch (error) {
      console.error('Error toggling product approval:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete a product
router.delete('/product/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.send({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Show all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
