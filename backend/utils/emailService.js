const nodemailer = require('nodemailer');

// ========================
// Envoi d'email
// - Si BREVO_API_KEY est défini : API HTTPS Brevo (utile si Render bloque le SMTP)
// - Sinon : SMTP Gmail (EMAIL_USER / EMAIL_PASS)
// ========================
const SENDER_NAME = 'GoTaxi';
const getSenderEmail = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;
const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const sendMail = async ({ to, subject, html }) => {
  if (!to) throw new Error('Destinataire manquant');

  // --- Option 1 : Brevo (API) ---
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

  // --- Option 2 : SMTP Gmail ---
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER / EMAIL_PASS non définis dans le .env');
  }

  const smtp = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await smtp.sendMail({
    from: `"${SENDER_NAME}" <${getSenderEmail()}>`,
    to,
    subject,
    html,
  });
};

// ========================
// Traductions
// ========================
const L = {
  fr: {
    locale: 'fr-FR',
    tagline: 'Votre service de taxi et excursions en Tunisie',
    footerRights: 'Tous droits réservés',
    priceOnRequest: 'Prix sur demande',
    priceOnRequestNotice: 'Le tarif exact vous sera communiqué par notre équipe lors de la confirmation.',
    hello: (first, last) => `Bonjour <strong>${escapeHtml(first)} ${escapeHtml(last)}</strong>,`,
    thankYouTitle: 'Merci pour votre réservation !',
    newBookingTitle: 'Nouvelle réservation reçue',
    // Transfert
    transferIntro: 'Votre réservation de transfert est bien enregistrée. Voici les détails :',
    transferSubject: (code) => `✅ Confirmation de transfert – ${code}`,
    transferSectionTrip: '🚗 Détails de votre trajet',
    transferContact: 'Notre équipe vous contactera prochainement pour confirmer les derniers détails.',
    seeYouSoon: 'À très bientôt !',
    // Champs communs
    labels: {
      departure: 'Départ',
      destination: 'Destination',
      departureDate: 'Date de départ',
      vehicle: 'Véhicule',
      totalPrice: 'Prix total',
      code: '🔑 Code de confirmation',
      codeShort: '🔑 Code',
      toConfirm: 'À confirmer',
      notProvided: 'Non renseigné',
      none: 'Aucune',
      adults: 'Adultes',
      children: 'Enfants',
      flight: 'Vol',
      specialRequests: 'Demandes spéciales',
      customer: '👤 Informations client',
      nameFull: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      tripDetails: '🚗 Détails du trajet',
      trip: 'Trajet',
      extraInfo: '📋 Informations supplémentaires',
      newBookingTransferIntro: 'Une nouvelle réservation de transfert vient d’être effectuée.',
      newBookingTransferSubject: (code) => `🔔 Nouvelle réservation transfert – ${code}`,
    },
    // Excursion
    excursionIntro: 'Votre réservation d’excursion est bien enregistrée. Voici les détails :',
    excursionSection: '🏞️ Détails de l’excursion',
    excursionContact: 'Notre équipe vous contactera sous peu pour finaliser les détails.',
    bye: 'À bientôt !',
    excursionSubject: (code) => `✅ Confirmation excursion – ${code}`,
    excursionCustomer: '👤 Client',
    excursionName: 'Excursion',
    preferredDate: 'Date préférée',
    departurePoint: 'Point de départ',
    groupSize: 'Taille du groupe',
    customItinerary: 'Itinéraire personnalisé',
    yes: 'Oui',
    no: 'Non',
    notSpecified: 'Non renseignée',
    persons: (n) => `${n} personnes`,
    newExcursionIntro: 'Une nouvelle réservation d’excursion a été enregistrée.',
    newExcursionSubject: (code) => `🔔 Nouvelle réservation excursion – ${code}`,
  },
  en: {
    locale: 'en-US',
    tagline: 'Your taxi and excursion service in Tunisia',
    footerRights: 'All rights reserved',
    priceOnRequest: 'Price on request',
    priceOnRequestNotice: 'The exact price will be communicated to you by our team upon confirmation.',
    hello: (first, last) => `Hello <strong>${escapeHtml(first)} ${escapeHtml(last)}</strong>,`,
    thankYouTitle: 'Thank you for your booking!',
    newBookingTitle: 'New booking received',
    // Transfer
    transferIntro: 'Your transfer booking has been successfully registered. Here are the details:',
    transferSubject: (code) => `✅ Transfer confirmation – ${code}`,
    transferSectionTrip: '🚗 Your trip details',
    transferContact: 'Our team will contact you soon to confirm the final details.',
    seeYouSoon: 'See you soon!',
    labels: {
      departure: 'Departure',
      destination: 'Destination',
      departureDate: 'Departure date',
      vehicle: 'Vehicle',
      totalPrice: 'Total price',
      code: '🔑 Confirmation code',
      codeShort: '🔑 Code',
      toConfirm: 'To be confirmed',
      notProvided: 'Not provided',
      none: 'None',
      adults: 'Adults',
      children: 'Children',
      flight: 'Flight',
      specialRequests: 'Special requests',
      customer: '👤 Customer information',
      nameFull: 'Full name',
      email: 'Email',
      phone: 'Phone',
      tripDetails: '🚗 Trip details',
      trip: 'Trip',
      extraInfo: '📋 Additional information',
      newBookingTransferIntro: 'A new transfer booking has just been made.',
      newBookingTransferSubject: (code) => `🔔 New transfer booking – ${code}`,
    },
    // Excursion
    excursionIntro: 'Your excursion booking has been successfully registered. Here are the details:',
    excursionSection: '🏞️ Excursion details',
    excursionContact: 'Our team will contact you shortly to finalize the details.',
    bye: 'See you soon!',
    excursionSubject: (code) => `✅ Excursion confirmation – ${code}`,
    excursionCustomer: '👤 Customer',
    excursionName: 'Excursion',
    preferredDate: 'Preferred date',
    departurePoint: 'Departure point',
    groupSize: 'Group size',
    customItinerary: 'Custom itinerary',
    yes: 'Yes',
    no: 'No',
    notSpecified: 'Not specified',
    persons: (n) => `${n} person(s)`,
    newExcursionIntro: 'A new excursion booking has been registered.',
    newExcursionSubject: (code) => `🔔 New excursion booking – ${code}`,
  },
};

const getLang = (booking) => (booking?.language === 'en' ? 'en' : 'fr');

// ========================
// Fonctions utilitaires
// ========================
const formatDate = (dateString, locale = 'fr-FR') => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(locale, options);
};

const formatDateOnly = (dateString, locale = 'fr-FR') =>
  new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

const CURRENCY = '€';

const formatPrice = (price, priceOnRequest = false, t = L.fr) => {
  if (priceOnRequest) return t.priceOnRequest;
  if (price === null || price === undefined || price === '') return t.priceOnRequest;
  if (typeof price === 'string' && isNaN(Number(price))) return price;

  const value = Number(price);
  if (!value || value <= 0) return t.priceOnRequest;

  return `${value}\u00A0${CURRENCY}`;
};

const isPriceOnRequest = (price, priceOnRequest = false, t = L.fr) =>
  formatPrice(price, priceOnRequest, t) === t.priceOnRequest;

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
// Styles communs
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

const row = (label, value, html = false) => `
  <tr style="${baseStyles.tableRow}">
    <td style="${baseStyles.tableLabel}">${label}</td>
    <td style="${baseStyles.tableValue}">${html ? value : escapeHtml(value)}</td>
  </tr>`;

const getBaseTemplate = (content, title = '', t = L.fr) => `
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="${baseStyles.logo}">🚖 GoTaxi</h1>
      <p style="${baseStyles.tagline}">${t.tagline}</p>
    </div>
    <div style="${baseStyles.content}">
      ${title ? `<h2 style="${baseStyles.heading}">${title}</h2>` : ''}
      ${content}
    </div>
    <div style="${baseStyles.footer}">
      <p>📞 +216 71 000 000 | ✉️ contact@gotaxi.tn</p>
      <p>© ${new Date().getFullYear()} GoTaxi – ${t.footerRights}</p>
    </div>
  </div>
`;

const priceOnRequestNotice = (booking, t) =>
  isPriceOnRequest(booking.totalPrice, booking.priceOnRequest, t)
    ? `<p style="color:#777; font-size: 14px;">${t.priceOnRequestNotice}</p>`
    : '';

// ========================
// Emails transfert
// ========================
const sendBookingConfirmation = async (booking) => {
  const t = L[getLang(booking)];
  const { email, firstName, lastName, from, to, departureDate, totalPrice, priceOnRequest, confirmationCode, vehicle } = booking;

  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">${t.hello(firstName, lastName)}</p>
    <p style="margin-bottom: 25px;">${t.transferIntro}</p>

    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">${t.labels.code} : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">${t.transferSectionTrip}</h3>
    <table style="${baseStyles.table}">
      ${row(t.labels.departure, from)}
      ${row(t.labels.destination, to)}
      ${row(t.labels.departureDate, formatDate(departureDate, t.locale))}
      ${row(t.labels.vehicle, vehicle?.name || t.labels.toConfirm)}
      ${row(t.labels.totalPrice, `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest, t))}</strong>`, true)}
    </table>

    ${priceOnRequestNotice(booking, t)}
    <div style="${baseStyles.divider}"></div>
    <p style="color: #777; font-size: 14px;">${t.transferContact}</p>
    <p style="margin-top: 20px;">${t.seeYouSoon}</p>
  `;

  await sendMail({
    to: email,
    subject: t.transferSubject(confirmationCode),
    html: getBaseTemplate(content, t.thankYouTitle, t),
  });
};

const sendAdminNotification = async (booking) => {
  const t = L[getLang(booking)];
  const {
    firstName, lastName, email, phone, from, to, departureDate,
    totalPrice, priceOnRequest, confirmationCode, vehicle,
    passengers, flightNumber, specialRequests,
  } = booking;

  const content = `
    <p>${t.labels.newBookingTransferIntro}</p>
    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">${t.labels.codeShort} : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">${t.labels.customer}</h3>
    <table style="${baseStyles.table}">
      ${row(t.labels.nameFull, `${firstName} ${lastName}`)}
      ${row(t.labels.email, email)}
      ${row(t.labels.phone, phone)}
    </table>

    <h3 style="${baseStyles.subheading}">${t.labels.tripDetails}</h3>
    <table style="${baseStyles.table}">
      ${row(t.labels.trip, `${from} → ${to}`)}
      ${row(t.labels.departureDate, formatDate(departureDate, t.locale))}
      ${row(t.labels.vehicle, vehicle?.name || t.labels.notProvided)}
      ${row(t.labels.totalPrice, `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest, t))}</strong>`, true)}
    </table>

    <h3 style="${baseStyles.subheading}">${t.labels.extraInfo}</h3>
    <table style="${baseStyles.table}">
      ${row(t.labels.adults, passengers?.adults ?? 1)}
      ${row(t.labels.children, passengers?.children ?? 0)}
      ${row(t.labels.flight, flightNumber || t.labels.notProvided)}
      ${row(t.labels.specialRequests, specialRequests || t.labels.none)}
    </table>
  `;

  await sendMail({
    to: getAdminEmail(),
    subject: t.labels.newBookingTransferSubject(confirmationCode),
    html: getBaseTemplate(content, t.newBookingTitle, t),
  });
};

// ========================
// Emails excursion
// ========================
const sendExcursionBookingConfirmation = async (booking) => {
  const t = L[getLang(booking)];
  const { email, firstName, lastName, confirmationCode, excursion, preferredDate, groupSize, departurePoint, totalPrice, priceOnRequest } = booking;

  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">${t.hello(firstName, lastName)}</p>
    <p style="margin-bottom: 25px;">${t.excursionIntro}</p>

    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">${t.labels.code} : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">${t.excursionSection}</h3>
    <table style="${baseStyles.table}">
      ${row(t.excursionName, `<strong>${escapeHtml(excursion?.name || t.labels.toConfirm)}</strong>`, true)}
      ${row(t.preferredDate, formatDateOnly(preferredDate, t.locale))}
      ${row(t.departurePoint, departurePoint)}
      ${row(t.groupSize, t.persons(groupSize))}
      ${row(t.labels.totalPrice, `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest, t))}</strong>`, true)}
    </table>

    ${priceOnRequestNotice(booking, t)}
    <div style="${baseStyles.divider}"></div>
    <p style="color: #777;">${t.excursionContact}</p>
    <p>${t.bye}</p>
  `;

  await sendMail({
    to: email,
    subject: t.excursionSubject(confirmationCode),
    html: getBaseTemplate(content, t.thankYouTitle, t),
  });
};

const sendExcursionAdminNotification = async (booking) => {
  const t = L[getLang(booking)];
  const {
    firstName, lastName, email, phone, confirmationCode, excursion,
    preferredDate, groupSize, departurePoint, totalPrice, priceOnRequest,
    customItinerary, specialRequests,
  } = booking;

  const content = `
    <p>${t.newExcursionIntro}</p>
    <div style="text-align: center;">
      <div style="${baseStyles.codeBox}">${t.labels.codeShort} : ${escapeHtml(confirmationCode)}</div>
    </div>

    <h3 style="${baseStyles.subheading}">${t.excursionCustomer}</h3>
    <table style="${baseStyles.table}">
      ${row(t.labels.nameFull, `${firstName} ${lastName}`)}
      ${row(t.labels.email, email)}
      ${row(t.labels.phone, phone)}
    </table>

    <h3 style="${baseStyles.subheading}">${t.excursionSection}</h3>
    <table style="${baseStyles.table}">
      ${row(t.excursionName, `<strong>${escapeHtml(excursion?.name || t.notSpecified)}</strong>`, true)}
      ${row(t.preferredDate, formatDateOnly(preferredDate, t.locale))}
      ${row(t.departurePoint, departurePoint)}
      ${row(t.groupSize, t.persons(groupSize))}
      ${row(t.labels.totalPrice, `<strong>${escapeHtml(formatPrice(totalPrice, priceOnRequest, t))}</strong>`, true)}
      ${row(t.customItinerary, customItinerary ? t.yes : t.no)}
      ${specialRequests ? row(t.labels.specialRequests, specialRequests) : ''}
    </table>
  `;

  await sendMail({
    to: getAdminEmail(),
    subject: t.newExcursionSubject(confirmationCode),
    html: getBaseTemplate(content, t.newBookingTitle, t),
  });
};

module.exports = {
  sendMail,
  sendBookingConfirmation,
  sendAdminNotification,
  sendExcursionBookingConfirmation,
  sendExcursionAdminNotification,
};