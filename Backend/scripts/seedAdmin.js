#!/usr/bin/env node
require('dotenv').config();
const db = require('../src/utils/db');
const User = require('../src/users/user.model');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fahadhedayet0@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'F@H@D0123';

(async () => {
  try {
    await db.connect();
    if (!db.isConnected()) {
      console.error('Database not connected. Cannot seed admin.');
      process.exit(1);
    }

    const existing = await User.findOne({ username: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    const admin = new User({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    await admin.save();
    console.log('Admin user created:', ADMIN_EMAIL);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
})();
