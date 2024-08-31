const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel'); // Ensure this path is correct

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get orders by userId
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.send(orders);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
