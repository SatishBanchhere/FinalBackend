require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');

const JWT_SECRET = process.env.SECRET_KEY; // Replace with a strong secret key
// User registration route
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Generate JWT token without expiration
    const token = jwt.sign(
      { id: user._id, nameChar : user.name[0]}, // Payload
      JWT_SECRET // Secret key
      // No expiresIn option to make it non-expiring
    );

    // Send response with token
    console.log({ user, token });
    res.status(201).send({ user, token });
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});


// Login user and generate JWT
router.post('/login', async (req, res) => {
  try {
    console.log("wow")
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('Invalid credentials');

    // Directly compare plain text passwords
    if (user.password !== password) {
      return res.status(401).send('Invalid credentials');
    }

    // Generate JWT without expiration, only with user _id
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);

    // Send response with token and user name
    res.send({ token, name: user.name[0] });
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});
// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied.');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid token.');
    req.user = user;
    next();
  });
};

// Example protected route
router.get('/profile', authenticate, (req, res) => {
  res.send(req.user);
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/product', async (req, res) => {
  console.log("Request received");

  const { id } = req.body;

  if (!id) {
    console.log("ID not provided");
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Find the product with the given ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/get-user', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send('Token is required');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    // Find the user by the decoded user ID
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    res.status(400).send('Invalid token');
  }
});


module.exports = router;
