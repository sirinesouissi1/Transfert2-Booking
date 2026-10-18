import { useState, useMemo } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiTruck,
  FiMap,
  FiCheck,
  FiSave,
} from 'react-icons/fi';
import { bookingAPI, excursionAPI, excursionBookingAPI } from '../services/api';   // ✅

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-green-400',
  'in-progress': 'bg-blue-400',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-400',
};

// ------------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------------
export default function BookingCalendar({ bookings = [], excursionBookings = [], vehicles = [], excursions = [], onRefresh }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Construit la grille de dates (avec les jours du mois précédent/suivant pour remplir)
  const gridDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Jours du mois précédent
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    // Jours du mois courant
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    // Jours du mois suivant pour compléter la grille (6 lignes max = 42 cases)
    while (days.length < 42) {
      const last = days[days.length - 1].date;
      days.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
        isCurrentMonth: false,
      });
    }
    return days;
  }, [year, month]);

  // Associe les réservations à leur date (clé : "YYYY-MM-DD")
  const bookingsByDay = useMemo(() => {
    const map = {};
    const addToMap = (dateStr, booking) => {
      if (!dateStr) return;
      const key = new Date(dateStr).toISOString().split('T')[0];
      if (!map[key]) map[key] = { transfers: [], excursions: [] };
      if (booking.bookingType === 'excursion' || booking.excursion) {
        map[key].excursions.push(booking);
      } else {
        map[key].transfers.push(booking);
      }
    };
    bookings.forEach((b) => addToMap(b.departureDate, b));
    excursionBookings.forEach((b) => addToMap(b.preferredDate || b.departureDate, b));
    return map;
  }, [bookings, excursionBookings]);

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const handleDayClick = (day) => {
    setSelectedDay(day.date);
    setModalOpen(true);
  };

  const isToday = (date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const toKey = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  return (
    <div>
      {/* En-tête du calendrier */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-serif text-cream">Calendrier des réservations</h1>
          <p className="text-muted text-sm mt-1">
            Cliquez sur un jour pour ajouter une réservation (transfert ou excursion).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-white/10 text-muted hover:text-gold hover:border-gold/40 rounded transition-colors"
          >
            Aujourd'hui
          </button>
          <div className="flex items-center bg-dark-2 border border-white/10 rounded overflow-hidden">
            <button
              onClick={goPrevMonth}
              className="px-3 py-2 text-muted hover:text-gold hover:bg-white/5 transition-colors"
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="px-4 text-sm text-cream font-serif min-w-[180px] text-center">
              {MONTHS_FR[month]} {year}
            </span>
            <button
              onClick={goNextMonth}
              className="px-3 py-2 text-muted hover:text-gold hover:bg-white/5 transition-colors"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold" /> Transfert
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Excursion
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" /> En attente
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Confirmé
        </span>
      </div>

      {/* Grille calendrier */}
      <div className="bg-dark-2 border border-white/5 rounded-lg overflow-hidden">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-dark-3">
          {DAYS_FR.map((d) => (
            <div
              key={d}
              className="text-center py-3 text-[10px] uppercase tracking-[3px] text-muted font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cases des jours */}
        <div className="grid grid-cols-7">
          {gridDays.map((cell, idx) => {
            const key = toKey(cell.date);
            const dayBookings = bookingsByDay[key] || { transfers: [], excursions: [] };
            const total = dayBookings.transfers.length + dayBookings.excursions.length;
            const today_ = isToday(cell.date);
            const isWeekend = [0, 6].includes(cell.date.getDay());

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(cell)}
                className={`relative text-left p-2 min-h-[110px] border-b border-r border-white/5 transition-colors hover:bg-white/5 group ${
                  !cell.isCurrentMonth ? 'opacity-30' : ''
                } ${today_ ? 'bg-gold/5' : ''}`}
              >
                {/* Numéro du jour */}
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      today_
                        ? 'bg-gold text-dark-2 w-6 h-6 rounded-full flex items-center justify-center'
                        : isWeekend
                        ? 'text-muted'
                        : 'text-cream'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">
                      {total}
                    </span>
                  )}
                </div>

                {/* Points / mini-résumés */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayBookings.transfers.slice(0, 2).map((b) => (
                    <div
                      key={b._id}
                      className="text-[9px] text-gold truncate flex items-center gap-1"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_COLORS[b.status] || 'bg-gold'
                        } flex-shrink-0`}
                      />
                      ✈ {b.firstName} → {b.to || 'N/A'}
                    </div>
                  ))}
                  {dayBookings.excursions.slice(0, 2).map((b) => (
                    <div
                      key={b._id}
                      className="text-[9px] text-blue-300 truncate flex items-center gap-1"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_COLORS[b.status] || 'bg-blue-400'
                        } flex-shrink-0`}
                      />
                      🏛 {b.excursion?.name || 'Excursion'}
                    </div>
                  ))}
                  {total > 4 && (
                    <div className="text-[9px] text-muted italic">
                      +{total - 4} autre(s)
                    </div>
                  )}
                </div>

                {/* Bouton "+" au survol */}
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gold bg-gold/10 rounded-full w-5 h-5 flex items-center justify-center">
                    +
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedDay && (
        <DayBookingModal
          date={selectedDay}
          vehicles={vehicles}
          excursions={excursions}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            onRefresh && onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Modal : 2 onglets (Transfert / Excursion)
// ------------------------------------------------------------------
function DayBookingModal({ date, vehicles, excursions, onClose, onCreated }) {
  const [tab, setTab] = useState('transfer');

  const dateStr = new Date(date).toISOString().split('T')[0];
  const prettyDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-2 border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-2 border-b border-white/5 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-serif text-cream capitalize">{prettyDate}</h2>
            <p className="text-muted text-xs mt-1">Ajouter une réservation à cette date</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-cream">
            <FiX size={22} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setTab('transfer')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === 'transfer'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-muted hover:text-cream'
            }`}
          >
            <FiTruck size={16} /> Réservation Transfert
          </button>
          <button
            onClick={() => setTab('excursion')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === 'excursion'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-muted hover:text-cream'
            }`}
          >
            <FiMap size={16} /> Réservation Excursion
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {tab === 'transfer' ? (
            <TransferForm
              date={dateStr}
              vehicles={vehicles}
              onCancel={onClose}
              onSuccess={onCreated}
            />
          ) : (
            <ExcursionForm
              date={dateStr}
              excursions={excursions}
              onCancel={onClose}
              onSuccess={onCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Formulaire Transfert
// ------------------------------------------------------------------
function TransferForm({ date, vehicles, onCancel, onSuccess }) {
  const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  from: '',
  to: '',
  departureDate: '',      // ← on le garde en state pour flexibilité
  departureTime: '10:00',
  tripType: 'one_way',    // ← AJOUTER
  vehicle: '',
  passengersAdults: 1,
  passengersChildren: 0,
  totalPrice: '',
  status: 'confirmed',
  flightNumber: '',
  specialRequests: '',
});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      return setError('Veuillez remplir les informations du client.');
    }
    if (!form.from || !form.to) {
      return setError('Veuillez renseigner le trajet.');
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        from: form.from.trim(),
        to: form.to.trim(),
        departureDate: date,
        departureTime: form.departureTime,
        tripType: form.tripType,                // ← AJOUTER
        vehicle: form.vehicle || undefined,
        passengers: {
          adults: Number(form.passengersAdults) || 1,
          children: Number(form.passengersChildren) || 0,
        },
        totalPrice: Number(form.totalPrice) || 0,
        status: form.status,
        flightNumber: form.flightNumber || undefined,
        specialRequests: form.specialRequests || undefined,
        bookingType: 'transfer',
      };

      const res = await bookingAPI.create(payload);
      if (res.data?.success) {
        onSuccess && onSuccess();
      } else {
        setError('Erreur lors de la création.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {/* Client */}
      <FormSection title="Client">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Prénom *" name="firstName" value={form.firstName} onChange={handleChange} />
          <Input label="Nom *" name="lastName" value={form.lastName} onChange={handleChange} />
          <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Téléphone *" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>
      </FormSection>

      {/* Trajet */}
   <FormSection title="Trajet">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Input label="Départ *" name="from" value={form.from} onChange={handleChange} placeholder="Ex: Tunis" />
    <Input label="Destination *" name="to" value={form.to} onChange={handleChange} placeholder="Ex: Hammamet" />
    <Select
      label="Type de trajet *"
      name="tripType"
      value={form.tripType}
      onChange={handleChange}
      options={[
        { value: 'one_way', label: 'Aller simple' },
        { value: 'round_trip', label: 'Aller-retour' },
      ]}
    />
    <Input label="Heure" name="departureTime" type="time" value={form.departureTime} onChange={handleChange} />
    <Select
      label="Véhicule"
      name="vehicle"
      value={form.vehicle}
      onChange={handleChange}
      options={[{ value: '', label: '— Sélectionner —' }, ...vehicles.map((v) => ({ value: v._id, label: v.name }))]}
      className="md:col-span-2"
    />
  </div>
</FormSection>

      {/* Passagers / tarif */}
      <FormSection title="Passagers & Tarif">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Adultes" name="passengersAdults" type="number" min="1" value={form.passengersAdults} onChange={handleChange} />
          <Input label="Enfants" name="passengersChildren" type="number" min="0" value={form.passengersChildren} onChange={handleChange} />
          <Input label="Prix (€)" name="totalPrice" type="number" min="0" value={form.totalPrice} onChange={handleChange} placeholder="0" />
          <Select
            label="Statut"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection title="Notes">
        <Input label="N° de vol" name="flightNumber" value={form.flightNumber} onChange={handleChange} />
        <Textarea label="Demandes spéciales" name="specialRequests" value={form.specialRequests} onChange={handleChange} />
      </FormSection>

      <ModalFooter onCancel={onCancel} submitting={submitting} label="Créer le transfert" />
    </form>
  );
}

// ------------------------------------------------------------------
// Formulaire Excursion
// ------------------------------------------------------------------
function ExcursionForm({ date, excursions, onCancel, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    excursion: '',
    groupSize: '4',
    departurePoint: 'Hammamet',
    totalPrice: '',
    status: 'confirmed',
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedExcursion = excursions.find((e) => e._id === form.excursion);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-calcul du prix quand on change excursion ou taille du groupe
  const handleExcursionOrGroupChange = (name, value) => {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      const exc = excursions.find((e) => e._id === updated.excursion);
      if (exc) {
        const gp = exc.groupPrices || {};
        const gpObj = gp instanceof Map ? Object.fromEntries(gp) : gp;
        const price = gpObj[updated.groupSize];
        if (price) updated.totalPrice = String(price);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      return setError('Veuillez remplir les informations du client.');
    }
    if (!form.excursion) {
      return setError('Veuillez sélectionner une excursion.');
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        excursion: form.excursion,
        preferredDate: date,
        groupSize: form.groupSize,
        departurePoint: form.departurePoint,
        totalPrice: Number(form.totalPrice) || 0,
        status: form.status,
        specialRequests: form.specialRequests || undefined,
      };

      const res = await excursionBookingAPI.create(payload);
      if (res.data?.success) {
        onSuccess && onSuccess();
      } else {
        setError('Erreur lors de la création.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {/* Client */}
      <FormSection title="Client">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Prénom *" name="firstName" value={form.firstName} onChange={handleChange} />
          <Input label="Nom *" name="lastName" value={form.lastName} onChange={handleChange} />
          <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Téléphone *" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>
      </FormSection>

      {/* Excursion */}
      <FormSection title="Excursion">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Excursion *"
            name="excursion"
            value={form.excursion}
            onChange={(e) => handleExcursionOrGroupChange('excursion', e.target.value)}
            options={[
              { value: '', label: '— Sélectionner une excursion —' },
              ...excursions.map((e) => ({ value: e._id, label: e.name })),
            ]}
            className="md:col-span-2"
          />
          <Select
            label="Taille du groupe"
            name="groupSize"
            value={form.groupSize}
            onChange={(e) => handleExcursionOrGroupChange('groupSize', e.target.value)}
            options={[
              { value: '4', label: "Jusqu'à 4 personnes" },
              { value: '6', label: "Jusqu'à 6 personnes" },
              { value: '8', label: "Jusqu'à 8 personnes" },
            ]}
          />
          <Select
            label="Point de départ"
            name="departurePoint"
            value={form.departurePoint}
            onChange={handleChange}
            options={[
              { value: 'Hammamet', label: 'Hammamet' },
              { value: 'Sousse', label: 'Sousse' },
              { value: 'Tunis', label: 'Tunis' },
            ]}
          />
          {selectedExcursion && (
            <div className="md:col-span-2 p-3 bg-gold/5 border border-gold/20 rounded text-xs text-muted">
              {selectedExcursion.destination} · {selectedExcursion.duration}
              {form.totalPrice && (
                <span className="text-gold ml-2 font-medium">
                  → {form.totalPrice} €
                </span>
              )}
            </div>
          )}
        </div>
      </FormSection>

      {/* Tarif */}
      <FormSection title="Tarif & Statut">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Prix total (€)" name="totalPrice" type="number" min="0" value={form.totalPrice} onChange={handleChange} />
          <Select
            label="Statut"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection title="Notes">
        <Textarea label="Demandes spéciales" name="specialRequests" value={form.specialRequests} onChange={handleChange} />
      </FormSection>

      <ModalFooter onCancel={onCancel} submitting={submitting} label="Créer l'excursion" />
    </form>
  );
}

// ------------------------------------------------------------------
// Petits composants UI réutilisables
// ------------------------------------------------------------------
function FormSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[3px] text-gold/60 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">{label}</label>
      <input
        {...props}
        className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
      />
    </div>
  );
}

function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">{label}</label>
      <select
        {...props}
        className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">{label}</label>
      <textarea
        {...props}
        rows="2"
        className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
      />
    </div>
  );
}

function ModalFooter({ onCancel, submitting, label }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2 text-muted hover:text-cream text-sm"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2 bg-gold text-dark-2 rounded text-sm font-medium hover:bg-gold/90 disabled:opacity-50"
      >
        <FiSave size={14} />
        {submitting ? 'Création...' : label}
      </button>
    </div>
  );
}