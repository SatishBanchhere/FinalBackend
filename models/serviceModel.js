const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  specifications: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Under Review', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Under Review',
  },
  price: {
    type: Number,
    default: 100, // Default value for price
  },
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
