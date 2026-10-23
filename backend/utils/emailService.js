const nodemailer = require('nodemailer');

// ========================
// Envoi d'email
// - Si BREVO_API_KEY est défini : API HTTPS Brevo (utile si Render bloque le SMTP)
// - Sinon : SMTP Gmail (EMAIL_USER / EMAIL_PASS)
// ========================
const smtp = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // mot de passe d'application Gmail (16 caractères, sans espaces)
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const SENDER_NAME = 'GoTaxi';
const getSenderEmail = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;
const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const sendMail = async ({ to, subject, html }) => {
  if (!to) throw new Error('Destinataire manquant');

  if (process.env.BREVO_API_KEY) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: getSenderEmail() },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER / EMAIL_PASS non définis');
  }

  await smtp.sendMail({
    from: `"${SENDER_NAME}" <${getSenderEmail()}>`,
    to,
    subject,
    html,
  });
};

// ========================
// Fonctions utilitaires
// ========================

// Formate une date en français (avec l'heure)
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Formate une date en français (sans l'heure)
const formatDateOnly = (dateString) =>
  new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

// Affiche le prix, ou "Prix sur demande" s'il n'est pas défini
const CURRENCY = '€';
const PRICE_ON_REQUEST = 'Prix sur demande';

const formatPrice = (price, priceOnRequest = false) => {
  if (priceOnRequest) return PRICE_ON_REQUEST;
  if (price === null || price === undefined || price === '') return PRICE_ON_REQUEST;

  if (typeof price === 'string' && isNaN(Number(price))) return price;

  const value = Number(price);
  if (!value || value <= 0) return PRICE_ON_REQUEST;

  return `${value}\u00A0${CURRENCY}`;
};

const isPriceOnRequest = (price, priceOnRequest = false) =>
  formatPrice(price, priceOnRequest) === PRICE_ON_REQUEST;

// Protège les emails contre l'injection HTML (les champs viennent des clients)
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ========================
// Styles communs – design épuré et moderne
// ========================
const baseStyles = {
  container: 'font-family: \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9f9f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);',
  header: 'background-color: #1a1a1a; padding: 30px 20px; text-align: center;',
  logo: 'font-size: 28px; font-weight: bold; color: #C9A84C; margin: 0; letter-spacing: -0.5px;',
  tagline: 'color: #999; font-size: 12px; margin-top: 5px;',
  content: 'padding: 30px 20px; background-color: #ffffff;',
  codeBox: 'background-color: #C9A84C; color: #1a1a1a; padding: 12px 20px; border-radius: 30px; font-size: 18px; font-weight: bold; display: inline-block; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
  heading: 'font-size: 24px; font-weight: 300; color: #1a1a1a; margin: 0 0 15px 0; border-left: 4px solid #C9A84C; padding-left: 15px;',
  subheading: 'font-size: 18px; font-weight: 500; color: #333; margin: 25px 0 15px 0;',
  table: 'width: 100%; border-collapse: collapse; margin: 20px 0;',
  tableRow: 'border-bottom: 1px solid #eee;',
  tableLabel: 'padding: 12px 0; font-weight: 600; color: #555; width: 40%; vertical-align: top;',
  tableValue: 'padding: 12px 0; color: #333; vertical-align: top;',
  divider: 'border-top: 1px solid #eee; margin: 25px 0;',
  footer: 'background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;',
  button: 'display: inline-block; background-color: #C9A84C; color: #1a1a1a; text-decoration: none; padding: 12px 25px; border-radius: 40px; font-weight: bold; margin: 15px 0;',
};

// Une ligne de tableau (label / valeur)
// Si html = true, la valeur est insérée telle quelle (déjà sécurisée par l'appelant)
const row = (label, value, html = false) => `
  <tr style="${baseStyles.tableRow}">
    <td style="${baseStyles.tableLabel}">${label}</td>
    <td style="${baseStyles.tableValue}">${html ? value : escapeHtml(value)}</td>
  </tr>`;

// Template de base
const getBaseTemplate = (content, title = '') => `
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="${baseStyles.logo}">🚖 GoTaxi</h1>
      <p style="${baseStyles.tagline}">Votre service de taxi et excursions en Tunisie</p>
    </div>
    <div style="${baseStyles.content}">
      ${title ? `<h2 style="${baseStyles.heading}">${title}</h2>` : ''}
      ${content}
    </div>
    <div style="${baseStyles.footer}">
      <p>📞 +216 71 000 000 | ✉️ contact@gotaxi.tn</p>
      <p>© ${new Date().getFullYear()} GoTaxi – Tous droits réservés</p>
    </div>
  </div>
`;

// Message affiché au client quand le prix est sur demande
const priceOnRequestNotice = (booking) =>
  isPriceOnRequest(booking.totalPrice, booking.priceOnRequest)
    ? '<p style="color:#777; font-size: 14px;">Le tarif exact vous sera communiqué par notre équipe lors de la confirmation.</p>'
    : '';

// ========================
// Emails de réservation de transfert
// ========================

const sendBookingConfirmation = async (booking) => {
  const { email, firstName, lastName, from, to, departureDate, totalPrice, priceOnRequest, confirmationCode, vehicle } = booking;

  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong>,</p>
    <p style="margin-bottom: 25px;">Votre réservation de transfert est bien enregistrée. Voici les détails :</p>

    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">🔑 Code de confirmation : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">🚗 Détails de votre trajet</h3>
    <table style="${baseStyles.table}">
      ${row('Départ', from)}
      ${row('Destination', to)}
      ${row('Date de départ', formatDate(departureDate))}
      ${row('Véhicule', vehicle?.name || 'À confirmer')}
      ${row('Prix total', `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest))}</strong>`, true)}
    </table>

    ${priceOnRequestNotice(booking)}
    <div style="${baseStyles.divider}"></div>
    <p style="color: #777; font-size: 14px;">Notre équipe vous contactera prochainement pour confirmer les derniers détails.</p>
    <p style="margin-top: 20px;">À très bientôt !</p>
  `;

  await sendMail({
    to: email,
    subject: `✅ Confirmation de transfert – ${confirmationCode}`,
    html: getBaseTemplate(content, 'Merci pour votre réservation !'),
  });
};

const sendAdminNotification = async (booking) => {
  const {
    firstName, lastName, email, phone, from, to, departureDate,
    totalPrice, priceOnRequest, confirmationCode, vehicle,
    passengers, flightNumber, specialRequests,
  } = booking;

  const content = `
    <p>Une nouvelle réservation de transfert vient d’être effectuée.</p>
    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">🔑 Code : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">👤 Informations client</h3>
    <table style="${baseStyles.table}">
      ${row('Nom complet', `${firstName} ${lastName}`)}
      ${row('Email', email)}
      ${row('Téléphone', phone)}
    </table>

    <h3 style="${baseStyles.subheading}">🚗 Détails du trajet</h3>
    <table style="${baseStyles.table}">
      ${row('Trajet', `${from} → ${to}`)}
      ${row('Date départ', formatDate(departureDate))}
      ${row('Véhicule', vehicle?.name || 'Non renseigné')}
      ${row('Prix total', `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest))}</strong>`, true)}
    </table>

    <h3 style="${baseStyles.subheading}">📋 Informations supplémentaires</h3>
    <table style="${baseStyles.table}">
      ${row('Adultes', passengers?.adults ?? 1)}
      ${row('Enfants', passengers?.children ?? 0)}
      ${row('Vol', flightNumber || 'Non renseigné')}
      ${row('Demandes spéciales', specialRequests || 'Aucune')}
    </table>
  `;

  await sendMail({
    to: getAdminEmail(),
    subject: `🔔 Nouvelle réservation transfert – ${confirmationCode}`,
    html: getBaseTemplate(content, 'Nouvelle réservation reçue'),
  });
};

// ========================
// Emails de réservation d'excursion
// ========================

const sendExcursionBookingConfirmation = async (booking) => {
  const { email, firstName, lastName, confirmationCode, excursion, preferredDate, groupSize, departurePoint, totalPrice, priceOnRequest } = booking;

  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong>,</p>
    <p style="margin-bottom: 25px;">Votre réservation d’excursion est bien enregistrée. Voici les détails :</p>

    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">🔑 Code de confirmation : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">🏞️ Détails de l’excursion</h3>
    <table style="${baseStyles.table}">
      ${row('Excursion', `<strong>${escapeHtml(excursion?.name || 'À confirmer')}</strong>`, true)}
      ${row('Date préférée', formatDateOnly(preferredDate))}
      ${row('Point de départ', departurePoint)}
      ${row('Taille du groupe', `${groupSize} personnes`)}
      ${row('Prix total', `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest))}</strong>`, true)}
    </table>

    ${priceOnRequestNotice(booking)}
    <div style="${baseStyles.divider}"></div>
    <p style="color: #777;">Notre équipe vous contactera sous peu pour finaliser les détails.</p>
    <p>À bientôt !</p>
  `;

  await sendMail({
    to: email,
    subject: `✅ Confirmation excursion – ${confirmationCode}`,
    html: getBaseTemplate(content, 'Merci pour votre réservation !'),
  });
};

const sendExcursionAdminNotification = async (booking) => {
  const {
    firstName, lastName, email, phone, confirmationCode, excursion,
    preferredDate, groupSize, departurePoint, totalPrice, priceOnRequest,
    customItinerary, specialRequests,
  } = booking;

  const content = `
    <p>Une nouvelle réservation d’excursion a été enregistrée.</p>
    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">🔑 Code : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">👤 Client</h3>
    <table style="${baseStyles.table}">
      ${row('Nom complet', `${firstName} ${lastName}`)}
      ${row('Email', email)}
      ${row('Téléphone', phone)}
    </table>

    <h3 style="${baseStyles.subheading}">🏞️ Détails de l’excursion</h3>
    <table style="${baseStyles.table}">
      ${row('Excursion', `<strong>${escapeHtml(excursion?.name || 'Non renseignée')}</strong>`, true)}
      ${row('Date préférée', formatDateOnly(preferredDate))}
      ${row('Point de départ', departurePoint)}
      ${row('Taille du groupe', `${groupSize} personnes`)}
      ${row('Prix total', `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest))}</strong>`, true)}
      ${row('Itinéraire personnalisé', customItinerary ? 'Oui' : 'Non')}
      ${specialRequests ? row('Demandes spéciales', specialRequests) : ''}
    </table>
  `;

  await sendMail({
    to: getAdminEmail(),
    subject: `🔔 Nouvelle réservation excursion – ${confirmationCode}`,
    html: getBaseTemplate(content, 'Nouvelle réservation reçue'),
  });
};

module.exports = {
  sendMail,
  sendBookingConfirmation,
  sendAdminNotification,
  sendExcursionBookingConfirmation,
  sendExcursionAdminNotification,
};