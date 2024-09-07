require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');
const Product = require('../models/productModel');

const JWT_SECRET = process.env.SECRET_KEY; // Replace with a strong secret key
// User registration route

const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase(); // Generates a random 8-character code
};

router.get('/random-products', async (req, res) => {
  try {
    // Fetch 4 random products that are approved
    const products = await Product.aggregate([
      { $match: { isApproved: true } },  // Filter for approved products
      { $sample: { size: 4 } }           // Randomly select 4 products
    ]);

    // Respond with the products
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random products' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { referralCode, ...userData } = req.body; // Extract referralCode from the request

    // Create a new user with a generated referral code
    const user = new User({
      ...userData,
      myReferralCode: generateReferralCode()
    });

    // If a referral code was provided, find the referring user
    if (referralCode) {
      const referringUser = await User.findOne({ myReferralCode: referralCode });

      if (referringUser) {
        // Apply discount to both the new user and the referring user
        user.discount += 100;
        referringUser.discount += 100;
        await referringUser.save();
      } else {
        return res.status(400).send('Invalid referral code');
      }
    }

    await user.save();

    // Generate JWT token without expiration
    const token = jwt.sign(
      { id: user._id, nameChar: user.name[0] }, // Payload
      JWT_SECRET // Secret key
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
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token.');
    req.user = user;
    next();
  });
};

// Example protected route
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the token
    console.log(req.user);
    // Find the user by ID
    const user = await User.findById(userId).select('-password'); // Exclude password from the response
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    console.log("Wow");
    console.log(user);
    // Send user details
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send('Error fetching profile');
  }
});


// Route to get user profile details
router.put('/profile', authenticate, async (req, res) => {
  try {
    const id = req.user.id; // Get user ID from the token
    console.log("waah re baba")
    const { name, gender, email, mobile, address, profileImageUrl } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).send('User not found');
    }
    console.log(mobile);
    // Update user details
    user.name = name || user.name;
    user.gender = gender || user.gender;
    // user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;

    // Save the updated user record
    await user.save();

    // Send updated user details
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send('Error updating profile');
  }
});

router.get('/products', async (req, res) => {
  try {
    // Find products where isApproved is true
    const products = await Product.find({ isApproved: true });
    console.log(products);
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});


router.get('/productsAdmin', async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to edit user profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, password, gender, profileImageUrl, address } = req.body;

    // Validate required fields
    if (!name && !email && !password && !gender && !profileImageUrl && !address) {
      return res.status(400).send('No fields to update');
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // User ID from the authenticated token
      { name, email, password, gender, profileImageUrl, address },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    // Send the updated user details
    res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(400).send('Error updating profile');
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
  console.log(token);
  console.log("Pochlo")
  if (!token) {
    return res.status(400).send('Token is required');
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    // Find the user by the decoded user ID

    const user = await User.findById(decoded.id);
    console.log(user);
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

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to update user role to admin
router.put('/users/:id/make-admin', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user by ID
    const user = await User.findById(userId);

    // Check if user exists and is not a superAdmin
    if (user && user.userRole !== 'superAdmin') {
      // Update user role to admin
      user.userRole = 'admin';
      await user.save();
      res.status(200).json({ message: 'User role updated to admin successfully' });
    } else {
      res.status(400).json({ message: 'Cannot change role of this user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



module.exports = router;
