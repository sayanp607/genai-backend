const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedLinks: [{ url: String, name: { type: String, default: '' }, createdAt: { type: Date, default: Date.now } }]

});

module.exports = mongoose.model('User', UserSchema);
