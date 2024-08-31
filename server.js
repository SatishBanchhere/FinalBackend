require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');

// Import routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// Middleware
app.use(cors()); // Enable CORS for all routes and origins
app.use(bodyParser.json()); // Parse incoming JSON requests

// Use routes
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);

// Connect to MongoDB
// mongoose.connect(process.env.DATABASE_URL)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Failed to connect to MongoDB', err));

const DATABASE_URL = process.env.DATABASE_URL;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));



// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
