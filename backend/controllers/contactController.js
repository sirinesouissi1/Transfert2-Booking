const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const { sendMail } = require('../utils/emailService'); // Tu as déjà ce fichier !

// @desc    Envoyer un message de contact
// @route   POST /api/contact
// @access  Public
exports.sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Veuillez remplir les champs obligatoires (Nom, Email, Message).');
  }

  // 1. Sauvegarder dans la base de données
  const contact = await Contact.create({ name, email, phone, subject, message });

  // 2. Envoyer un email à l'admin (en arrière-plan pour ne pas bloquer la réponse)
  try {
    await sendMail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🔔 Nouveau message de contact - ${name}`,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Sujet :</strong> ${subject || 'Non renseigné'}</p>
        <p><strong>Message :</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #C9A84C;">
          ${message}
        </blockquote>
      `,
    });
    console.log('✅ Email de contact envoyé à l\'admin');
  } catch (err) {
    console.error('❌ Erreur envoi email contact :', err.message);
  }

  res.status(201).json({ success: true, message: 'Message envoyé avec succès !' });
});

// @desc    Obtenir tous les messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContactMessages = asyncHandler(async (req, res) => {
  const messages = await Contact.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: messages.length, messages });
});

// @desc    Marquer un message comme lu (Admin)
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
exports.markAsRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Message non trouvé');
  }
  contact.isRead = true;
  await contact.save();
  res.json({ success: true, contact });
});

// @desc    Supprimer un message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContactMessage = asyncHandler(async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Message supprimé' });
});