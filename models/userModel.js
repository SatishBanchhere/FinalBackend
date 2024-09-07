const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  profileImageUrl: { type: String },
  address: { type: String },
  mobile: { type: String },
  referralCode: { type: String },
  discount: { type: Number, default: 0 },
  myReferralCode: { type: String, unique: true }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
