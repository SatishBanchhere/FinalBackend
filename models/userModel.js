const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, // Gender field with enumeration
  profileImageUrl: { type: String }, // URL for the profile image
  address: { type: String }, // Address as a single string
  mobile: { type: String }, // Address as a single string
  referralCode: { type: String }, // Code user was referred by (optional)
  discount: { type: Number, default: 0 }, // User discount, defaults to 0
  myReferralCode: { type: String, unique: true } // Unique referral code for this user
}, {
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

const User = mongoose.model('User', userSchema);

module.exports = User;
