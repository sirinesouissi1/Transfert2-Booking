// Utilitaires du tableau de bord GO TAXI :
// export CSV, WhatsApp, détection de conflits, bon de réservation, agrégats de revenus.

const pad = (n) => String(n).padStart(2, '0');

export const LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

// Statuts qui comptent dans le chiffre d'affaires
export const REVENUE_STATUSES = ['confirmed', 'in-progress', 'completed'];

// ------------------------------------------------------------------
// Accesseurs tolérants (transferts et excursions n'ont pas les mêmes champs)
// ------------------------------------------------------------------
export const idOf = (v) => (v && typeof v === 'object' ? v._id : v) || null;
export const getTotal = (b) => Number(b?.totalPrice ?? b?.total ?? 0) || 0;
export const getBookingDate = (b) => b?.departureDate || b?.preferredDate || null;
export const getFullName = (b) => `${b?.firstName || ''} ${b?.lastName || ''}`.trim();
export const getTitle = (b) =>
  b?.excursion?.name || (b?.from && b?.to ? `${b.from} → ${b.to}` : 'Réservation');
export const getPickup = (b) =>
  b?.pickupAddress || b?.pickupLocation || b?.departurePoint || b?.from || '';
export const getPassengers = (b) => {
  if (b?.groupSize) return Number(b.groupSize) || 0;
  if (b?.passengers && typeof b.passengers === 'object') {
    return (b.passengers.adults || 0) + (b.passengers.children || 0);
  }
  return Number(b?.passengers) || 0;
};
export const getTimeString = (b) => {
  const t = b?.departureTime || b?.pickupTime || b?.startTime || b?.time;
  return typeof t === 'string' && /^\d{1,2}:\d{2}/.test(t) ? t.slice(0, 5) : '';
};

export const fmtDateFR = (d, long = false) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString(
    'fr-FR',
    long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : undefined
  );
};

export const resolveVehicleName = (b, vehicles = []) => {
  const assignedId = idOf(b?.assignedVehicle);
  if (b?.assignedVehicle && typeof b.assignedVehicle === 'object' && b.assignedVehicle.name) {
    return b.assignedVehicle.name;
  }
  if (assignedId) {
    const v = vehicles.find((x) => x._id === assignedId);
    if (v) return v.name;
  }
  return b?.vehicle?.name || '';
};

// ------------------------------------------------------------------
// Export CSV (séparateur ; + BOM UTF-8 => s'ouvre directement dans Excel FR)
// ------------------------------------------------------------------
const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  // Protection contre l'injection de formules dans Excel
  if (/^[=@]/.test(s) || /^[+-][A-Za-z(]/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCSV(baseName, columns, rows) {
  const head = columns.map((c) => csvCell(c.label)).join(';');
  const body = rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(';'));
  const blob = new Blob(['﻿' + [head, ...body].join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export const transferColumns = (vehicles = []) => [
  { label: 'Code', value: (b) => b.confirmationCode },
  { label: 'Client', value: getFullName },
  { label: 'Email', value: (b) => b.email },
  { label: 'Téléphone', value: (b) => b.phone },
  { label: 'Départ', value: (b) => b.from },
  { label: 'Destination', value: (b) => b.to },
  { label: 'Date', value: (b) => fmtDateFR(b.departureDate) },
  { label: 'Heure', value: getTimeString },
  { label: 'Passagers', value: getPassengers },
  { label: 'Véhicule', value: (b) => resolveVehicleName(b, vehicles) },
  { label: 'Chauffeur', value: (b) => b.assignedDriver },
  { label: 'Prix (€)', value: (b) => (getTotal(b) ? getTotal(b) : 'Sur demande') },
  { label: 'Statut', value: (b) => LABELS[b.status] || b.status },
  { label: 'Créée le', value: (b) => fmtDateFR(b.createdAt) },
];

export const excursionBookingColumns = (vehicles = []) => [
  { label: 'Code', value: (b) => b.confirmationCode },
  { label: 'Client', value: getFullName },
  { label: 'Email', value: (b) => b.email },
  { label: 'Téléphone', value: (b) => b.phone },
  { label: 'Excursion', value: (b) => b.excursion?.name },
  { label: 'Date préférée', value: (b) => fmtDateFR(b.preferredDate || b.departureDate) },
  { label: 'Point de départ', value: (b) => b.departurePoint },
  { label: 'Participants', value: getPassengers },
  { label: 'Véhicule', value: (b) => resolveVehicleName(b, vehicles) },
  { label: 'Chauffeur', value: (b) => b.assignedDriver },
  { label: 'Prix (€)', value: (b) => (getTotal(b) ? getTotal(b) : 'Sur demande') },
  { label: 'Statut', value: (b) => LABELS[b.status] || b.status },
  { label: 'Demandes spéciales', value: (b) => b.specialRequests },
  { label: 'Créée le', value: (b) => fmtDateFR(b.createdAt) },
];

export const clientColumns = [
  { label: 'Nom', value: (c) => `${c.firstName || ''} ${c.lastName || ''}`.trim() },
  { label: 'Email', value: (c) => c.email },
  { label: 'Téléphone', value: (c) => c.phone },
  { label: 'Réservations', value: (c) => c.totalBookings },
  { label: 'Dernière activité', value: (c) => fmtDateFR(c.lastBooking) },
];

// ------------------------------------------------------------------
// WhatsApp
// ------------------------------------------------------------------
// wa.me exige le format international sans "+" ni espaces.
// Un numéro à 8 chiffres est considéré comme tunisien (+216).
export function normalizePhone(raw, defaultCountryCode = '216') {
  if (!raw) return '';
  const str = String(raw).trim();
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';
  if (str.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.length === 8) return defaultCountryCode + digits;
  return digits;
}

export function buildWhatsAppMessage(b) {
  const hello = `Bonjour ${b?.firstName || ''}`.trim() + ',';
  if (!b?.confirmationCode) return `${hello}\n\nGO TAXI à votre service.`;

  const time = getTimeString(b);
  const date = fmtDateFR(getBookingDate(b), true);
  const lines = [
    hello,
    '',
    `Concernant votre réservation GO TAXI *${b.confirmationCode}* (${(LABELS[b.status] || '').toLowerCase()}) :`,
    `• Service : ${getTitle(b)}`,
    date ? `• Date : ${date}${time ? ` à ${time}` : ''}` : null,
    getPickup(b) ? `• Lieu de prise en charge : ${getPickup(b)}` : null,
    getPassengers(b) > 0 ? `• Passagers : ${getPassengers(b)}` : null,
    b.assignedDriver ? `• Chauffeur : ${b.assignedDriver}` : null,
    '',
    'Nous restons à votre disposition.',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

export function buildWhatsAppLink(b) {
  const num = normalizePhone(b?.phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(buildWhatsAppMessage(b))}`;
}

// ------------------------------------------------------------------
// Conflits chauffeur / véhicule
// ------------------------------------------------------------------
const isActive = (b) => !['cancelled', 'completed'].includes(b?.status);
const norm = (s) => String(s || '').trim().toLowerCase();

const dayKey = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  return isNaN(d) ? null : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const minutesOf = (b) => {
  const t = getTimeString(b);
  if (!t) return null;
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
};

const durationMin = (b) => (b?.bookingType === 'excursion' || b?.excursion ? 8 : 3) * 60;

// Même jour ; si les deux heures sont connues, il faut que les créneaux se chevauchent
function overlaps(a, b) {
  const da = dayKey(getBookingDate(a));
  const db = dayKey(getBookingDate(b));
  if (!da || da !== db) return false;
  const ma = minutesOf(a);
  const mb = minutesOf(b);
  if (ma === null || mb === null) return true;
  return Math.abs(ma - mb) < Math.max(durationMin(a), durationMin(b));
}

const isSame = (a, b) =>
  a._id === b._id || (a.confirmationCode && a.confirmationCode === b.confirmationCode);

/**
 * Conflits d'une réservation avec les autres.
 * `overrides` permet de tester une affectation avant de l'enregistrer.
 */
export function findConflicts(target, pool = [], overrides = {}) {
  const vehicleId =
    idOf('assignedVehicle' in overrides ? overrides.assignedVehicle : target.assignedVehicle) || null;
  const driver = norm('assignedDriver' in overrides ? overrides.assignedDriver : target.assignedDriver);
  if (!vehicleId && !driver) return [];

  const out = [];
  pool.forEach((o) => {
    if (isSame(o, target) || !isActive(o) || !overlaps(target, o)) return;
    const reasons = [];
    if (vehicleId && idOf(o.assignedVehicle) === vehicleId) reasons.push('Véhicule déjà affecté');
    if (driver && norm(o.assignedDriver) === driver) reasons.push('Chauffeur déjà affecté');
    if (reasons.length) out.push({ booking: o, reasons });
  });
  return out;
}

export function buildConflictMap(all = []) {
  const assigned = all.filter((b) => isActive(b) && (b.assignedDriver || idOf(b.assignedVehicle)));
  const map = new Map();
  assigned.forEach((b) => {
    const c = findConflicts(b, assigned);
    if (c.length) map.set(b._id, c);
  });
  return map;
}

// ------------------------------------------------------------------
// Fusion transferts + excursions (sans doublons) et agrégats de revenus
// ------------------------------------------------------------------
export function mergeAllBookings(primary = [], secondary = []) {
  const seen = new Map();
  [...primary, ...secondary].forEach((b) => {
    const key = b.confirmationCode || b._id;
    if (!seen.has(key)) seen.set(key, b);
  });
  return [...seen.values()];
}

export function revenueByMonth(all, months = 12) {
  const map = new Map();
  all.forEach((b) => {
    if (!REVENUE_STATUSES.includes(b.status)) return;
    const d = new Date(getBookingDate(b) || b.createdAt);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const e = map.get(key) || { key, revenue: 0, count: 0 };
    e.revenue += getTotal(b);
    e.count += 1;
    map.set(key, e);
  });
  return [...map.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-months)
    .map((e) => ({ ...e, name: `${e.key.slice(5)}/${e.key.slice(0, 4)}` }));
}

export function topDestinations(all, limit = 6) {
  const map = new Map();
  all.forEach((b) => {
    if (b.status === 'cancelled') return;
    const name = b.excursion?.name || b.to;
    if (!name) return;
    const e = map.get(name) || { name, count: 0, revenue: 0 };
    e.count += 1;
    if (REVENUE_STATUSES.includes(b.status)) e.revenue += getTotal(b);
    map.set(name, e);
  });
  return [...map.values()].sort((a, b) => b.count - a.count || b.revenue - a.revenue).slice(0, limit);
}

export function revenueByVehicle(all, vehicles = [], limit = 6) {
  const map = new Map();
  all.forEach((b) => {
    if (!REVENUE_STATUSES.includes(b.status)) return;
    const name = resolveVehicleName(b, vehicles);
    if (!name) return;
    const e = map.get(name) || { name, revenue: 0, count: 0 };
    e.revenue += getTotal(b);
    e.count += 1;
    map.set(name, e);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

// ------------------------------------------------------------------
// Bon de réservation : page imprimable (« Enregistrer au format PDF »)
// ------------------------------------------------------------------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function printVoucher(b, { vehicleName = '' } = {}) {
  const w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) return false;

  const time = getTimeString(b);
  const total = getTotal(b);
  const isExcursion = Boolean(b.excursion) || b.bookingType === 'excursion';
  const rows = [
    ['Service', getTitle(b)],
    ['Date', `${fmtDateFR(getBookingDate(b), true)}${time ? ` à ${time}` : ''}`],
    [isExcursion ? 'Point de départ' : 'Prise en charge', getPickup(b)],
    !isExcursion && b.to ? ['Destination', b.to] : null,
    ['Passagers', getPassengers(b) || ''],
    ['Véhicule', vehicleName],
    ['Chauffeur', b.assignedDriver],
    ['Prix total', total ? `${total} €` : 'Sur demande'],
    b.specialRequests ? ['Demandes spéciales', b.specialRequests] : null,
  ].filter((r) => r && r[1] !== '' && r[1] !== undefined && r[1] !== null);

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<title>Bon de réservation ${esc(b.confirmationCode)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1f1f2e; margin: 0; }
  .head { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #C9A84C; padding-bottom:14px; }
  .brand { font-size:30px; letter-spacing:6px; } .brand span { color:#C9A84C; }
  .title { font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#666; }
  .code { margin:28px 0 8px; padding:18px; border:1px solid #C9A84C; background:#faf6e9; text-align:center; }
  .code small { display:block; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#777; }
  .code strong { font-family: 'Courier New', monospace; font-size:30px; letter-spacing:3px; }
  .status { text-align:center; font-size:13px; margin-bottom:26px; color:#555; }
  h2 { font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#C9A84C; margin:24px 0 6px; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  td { padding:9px 4px; border-bottom:1px solid #e6e6e6; vertical-align:top; }
  td:first-child { width:36%; color:#777; }
  .foot { margin-top:40px; font-size:12px; color:#777; line-height:1.6; border-top:1px solid #ddd; padding-top:12px; }
</style></head><body>
  <div class="head">
    <div class="brand">GO<span>TAXI</span></div>
    <div class="title">Bon de réservation</div>
  </div>
  <div class="code"><small>Code de confirmation</small><strong>${esc(b.confirmationCode)}</strong></div>
  <div class="status">Statut : <strong>${esc(LABELS[b.status] || b.status)}</strong></div>
  <h2>Client</h2>
  <table>
    <tr><td>Nom</td><td>${esc(getFullName(b))}</td></tr>
    ${b.email ? `<tr><td>Email</td><td>${esc(b.email)}</td></tr>` : ''}
    ${b.phone ? `<tr><td>Téléphone</td><td>${esc(b.phone)}</td></tr>` : ''}
  </table>
  <h2>Détails du service</h2>
  <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
  <div class="foot">
    Merci de présenter ce bon (imprimé ou sur téléphone) à votre chauffeur.<br/>
    Document émis le ${esc(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))}.
  </div>
</body></html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
  return true;
}
