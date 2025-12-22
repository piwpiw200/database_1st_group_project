const mongoose = require('mongoose');
require('dotenv').config();

let _isConnected = false;

async function connect() {
  const uri = process.env.DB_URL;
  if (!uri) {
    console.warn('DB_URL not provided — running in offline mode');
    _isConnected = false;
    return;
  }

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    _isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    _isConnected = false;
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);
  }
}

function isConnected() {
  return _isConnected;
}

module.exports = { connect, isConnected, mongoose };
