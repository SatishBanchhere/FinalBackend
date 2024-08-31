const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  thumbnail: { type: String },
  highlightImages: [String],
  description: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
