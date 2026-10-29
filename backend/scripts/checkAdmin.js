require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Base :', mongoose.connection.name);

  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log('❌ Aucun utilisateur avec cet email dans cette base');
    const admins = await User.find({ role: 'admin' }).select('email role');
    console.log('Admins présents :', admins.map((a) => a.email));
  } else {
    console.log('✅ Utilisateur trouvé :', user.email);
    console.log('Rôle :', user.role);
    console.log('Mot de passe correct :', await user.matchPassword(process.env.ADMIN_PASSWORD));
  }
  process.exit(0);
})();