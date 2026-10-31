import { useMemo, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiAlertTriangle, FiFileText, FiPhone, FiSave } from 'react-icons/fi';
import { useToast } from './Toast';
import {
  buildWhatsAppLink,
  fmtDateFR,
  findConflicts,
  getFullName,
  getPassengers,
  getTimeString,
  idOf,
  normalizePhone,
  printVoucher,
  resolveVehicleName,
} from '../../utils/bookingTools';

// Pastille rouge de compteur (menu)
export function CountBadge({ n }) {
  if (!n) return null;
  return (
    <span className="bg-red-500 text-white text-[10px] leading-none px-1.5 py-1 rounded-full ml-2 min-w-[18px] text-center">
      {n > 99 ? '99+' : n}
    </span>
  );
}

// ------------------------------------------------------------------
// WhatsApp + appel
// ------------------------------------------------------------------
// `data` = une réservation (message pré-rempli complet) ou un client (simple salutation)
export function ContactButtons({ data }) {
  const phone = data?.phone;
  const wa = buildWhatsAppLink(data);
  if (!phone) return <span className="text-xs text-muted">Pas de numéro de téléphone</span>;

  return (
    <>
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
        >
          <FaWhatsapp size={16} /> WhatsApp
        </a>
      ) : null}
      <a
        href={`tel:${phone}`}
        className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-white/5 text-cream border border-white/10 hover:border-gold/40 transition-colors"
      >
        <FiPhone size={15} /> Appeler
      </a>
    </>
  );
}

// Petites icônes pour les lignes de tableau
export function RowContactIcons({ data }) {
  const wa = buildWhatsAppLink(data);
  if (!data?.phone) return null;
  return (
    <>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-muted hover:text-green-400 transition-colors"
          title="Écrire sur WhatsApp"
        >
          <FaWhatsapp size={18} />
        </a>
      )}
      <a href={`tel:${data.phone}`} className="p-1 text-muted hover:text-gold transition-colors" title="Appeler">
        <FiPhone size={17} />
      </a>
    </>
  );
}

// ------------------------------------------------------------------
// Bon de réservation (impression / PDF)
// ------------------------------------------------------------------
const VOUCHER_STATUSES = ['confirmed', 'in-progress', 'completed'];

function VoucherButton({ booking, vehicles }) {
  const toast = useToast();
  const enabled = VOUCHER_STATUSES.includes(booking.status);

  const onClick = () => {
    const ok = printVoucher(booking, { vehicleName: resolveVehicleName(booking, vehicles) });
    if (!ok) toast.error('Le navigateur a bloqué la fenêtre. Autorisez les pop-ups pour générer le bon.');
    else toast.info('Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».');
  };

  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      title={enabled ? 'Générer le bon de réservation' : 'Disponible une fois la réservation confirmée'}
      className="flex items-center gap-2 px-3 py-2 rounded text-sm border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <FiFileText size={15} /> Bon PDF
    </button>
  );
}

export function BookingQuickActions({ booking, vehicles }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ContactButtons data={booking} />
      <VoucherButton booking={booking} vehicles={vehicles} />
    </div>
  );
}

// ------------------------------------------------------------------
// Conflits
// ------------------------------------------------------------------
export function ConflictBadge({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;
  const text = conflicts
    .map((c) => `${c.reasons.join(' + ')} (${c.booking.confirmationCode || 'autre réservation'})`)
    .join('\n');
  return (
    <span className="text-orange-400" title={`Conflit d'affectation :\n${text}`}>
      <FiAlertTriangle size={14} />
    </span>
  );
}

// ------------------------------------------------------------------
// Affectation chauffeur + véhicule (avec détection de conflits en direct)
// ------------------------------------------------------------------
export function AssignmentSection({ item, resource, vehicles, allBookings, onAssign }) {
  const [driver, setDriver] = useState(item.assignedDriver || '');
  const [vehicleId, setVehicleId] = useState(idOf(item.assignedVehicle) || '');
  const [saving, setSaving] = useState(false);

  const drivers = useMemo(
    () => [...new Set(allBookings.map((b) => b.assignedDriver).filter(Boolean))],
    [allBookings]
  );

  const conflicts = useMemo(
    () => findConflicts(item, allBookings, { assignedDriver: driver, assignedVehicle: vehicleId }),
    [item, allBookings, driver, vehicleId]
  );

  const selectedVehicle = vehicles.find((v) => v._id === vehicleId);
  const passengers = getPassengers(item);
  const tooSmall = selectedVehicle?.capacity && passengers > Number(selectedVehicle.capacity);

  const dirty =
    driver.trim() !== (item.assignedDriver || '') || vehicleId !== (idOf(item.assignedVehicle) || '');

  const save = async () => {
    setSaving(true);
    try {
      await onAssign(resource, item._id, {
        assignedDriver: driver.trim(),
        assignedVehicle: vehicleId || null,
      });
    } catch {
      /* l'erreur est déjà affichée par onAssign */
    } finally {
      setSaving(false);
    }
  };

  const warn = conflicts.length > 0 || tooSmall;

  return (
    <div className="bg-[#35354A] border border-white/10 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/10">
        <h3 className="text-[11px] uppercase tracking-[2px] text-cream/80 font-medium">Affectation</h3>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Chauffeur</label>
            <input
              list="drivers-list"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="Nom du chauffeur"
              className="w-full bg-[#2A2A3C] border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
            />
            <datalist id="drivers-list">
              {drivers.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Véhicule</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-[#2A2A3C] border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
            >
              <option value="">— Non affecté —</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                  {v.capacity ? ` (${v.capacity} pers.)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!getTimeString(item) && (
          <p className="text-[11px] text-muted">
            Aucune heure enregistrée sur cette réservation : toute affectation le même jour est signalée comme conflit
            potentiel.
          </p>
        )}

        {tooSmall && (
          <div className="flex items-start gap-2 p-3 rounded border border-orange-400/30 bg-orange-400/5 text-orange-300 text-xs">
            <FiAlertTriangle className="mt-0.5 shrink-0" size={14} />
            <span>
              Capacité insuffisante : {passengers} passager(s) pour {selectedVehicle.capacity} place(s).
            </span>
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="p-3 rounded border border-orange-400/30 bg-orange-400/5 text-orange-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <FiAlertTriangle size={14} /> Conflit détecté
            </div>
            <ul className="list-disc ml-5 space-y-0.5">
              {conflicts.map((c) => (
                <li key={c.booking._id}>
                  {c.reasons.join(' + ')} sur {c.booking.confirmationCode || 'une autre réservation'} (
                  {getFullName(c.booking)}, {fmtDateFR(c.booking.departureDate || c.booking.preferredDate)}
                  {getTimeString(c.booking) ? ` à ${getTimeString(c.booking)}` : ''})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={!dirty || saving}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              warn ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gold text-dark-2 hover:bg-gold/90'
            }`}
          >
            <FiSave size={14} />
            {saving ? 'Enregistrement…' : warn ? 'Enregistrer malgré l’alerte' : 'Enregistrer l’affectation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Exporté pour réutilisation éventuelle
export { normalizePhone };
