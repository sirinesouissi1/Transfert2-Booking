require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL.toLowerCase();
  let admin = await User.findOne({ email });

  if (!admin) {
    admin = new User({
      firstName: 'Chedli',
      lastName: 'Mrad',
      email,
      password: process.env.ADMIN_PASSWORD, // hashé par ton pre('save')
      phone: '00000000',
      role: 'admin',
    });
  } else {
    admin.role = 'admin';
    admin.password = process.env.ADMIN_PASSWORD;
  }

  await admin.save();
  console.log('✅ Admin prêt :', email);
  process.exit(0);
})();