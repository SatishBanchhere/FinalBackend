const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Unique coupon code
  price: { 
    type: Number, 
    required: true 
  }, // Discount amount in a fixed price
  expiryDate: { 
    type: Date, 
    required: true 
  }, // Date when the coupon expires
  peopleLimit: { 
    type: Number, 
    required: true 
  }, // Maximum number of people who can use the coupon
  usedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }] // Array to track users who have used the coupon
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
