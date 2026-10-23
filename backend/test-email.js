const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sendMail } = require('./utils/emailService');

(async () => {
  console.log('EMAIL_USER =', process.env.EMAIL_USER || '❌ non défini');
  console.log('EMAIL_PASS =', process.env.EMAIL_PASS ? '✅ défini' : '❌ non défini');

  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  try {
    await sendMail({
      to,
      subject: 'Test GoTaxi',
      html: '<p>Si tu lis ceci, l’envoi d’emails fonctionne ✅</p>',
    });
    console.log('✅ Email de test envoyé à', to);
  } catch (err) {
    console.error('❌ Échec :', err.message);
  }
})();