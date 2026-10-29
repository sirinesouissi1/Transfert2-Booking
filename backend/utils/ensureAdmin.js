const User = require('../models/User');

module.exports = async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('⚠️ ADMIN_EMAIL / ADMIN_PASSWORD non définis : admin non créé');
    return;
  }

  let admin = await User.findOne({ email }).select('+password');

  if (!admin) {
    admin = new User({
      firstName: 'Chedli',
      lastName: 'Mrad',
      email,
      password,
      phone: '00000000',
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Admin créé :', email);
    return;
  }

  let changed = false;
  if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
  if (!(await admin.matchPassword(password))) { admin.password = password; changed = true; }

  if (changed) {
    await admin.save();
    console.log('✅ Admin mis à jour :', email);
  } else {
    console.log('✅ Admin déjà prêt :', email);
  }
};