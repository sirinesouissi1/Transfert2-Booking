// AdminBookings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const STATUS_COLOR = { pending: 'text-yellow-400', confirmed: 'text-green-400', 'in-progress': 'text-blue-400', completed: 'text-muted', cancelled: 'text-red-400' };
const ALL_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
const LABELS = { pending: 'En attente', confirmed: 'Confirmé', 'in-progress': 'En cours', completed: 'Terminé', cancelled: 'Annulé' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getAll({ status: filter || undefined, limit: 50 });
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status });
      toast.success('Statut mis à jour');
      fetchBookings();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT p-8 pt-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-muted hover:text-gold transition-colors"><FiArrowLeft /></Link>
          <h1 className="font-serif text-3xl font-light text-cream">Gestion des Réservations</h1>
        </div>

        {/* Filter */}
        <div className="flex gap-0 mb-6">
          <button onClick={() => setFilter('')} className={`px-5 py-2 text-xs tracking-[2px] uppercase border-b-2 transition-all ${filter === '' ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-gold'}`}>Toutes</button>
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 text-xs tracking-[2px] uppercase border-b-2 transition-all ${filter === s ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-gold'}`}>
              {LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="bg-dark-3 h-16 animate-pulse" />)}</div>
        ) : (
          <div className="bg-dark-3 border border-gold/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 text-muted text-xs tracking-[2px] uppercase">
                  {['Code', 'Client', 'Service', 'Date', 'Passagers', 'Total', 'Paiement', 'Statut', 'Action'].map((h) => (
                    <th key={h} className="text-left px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gold/5 hover:bg-dark-4 transition-colors">
                    <td className="px-5 py-4 text-gold font-mono text-xs">{b.confirmationCode}</td>
                    <td className="px-5 py-4 text-cream">{b.user?.firstName} {b.user?.lastName}<br /><span className="text-muted text-xs">{b.user?.phone}</span></td>
                    <td className="px-5 py-4 text-muted text-xs">{b.bookingType === 'excursion' ? `🏛 ${b.excursion?.name || '—'}` : `✈ ${b.from} → ${b.to}`}</td>
                    <td className="px-5 py-4 text-muted text-xs">{new Date(b.departureDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-4 text-cream text-center">{b.passengers}</td>
                    <td className="px-5 py-4 text-gold font-serif text-lg font-light">{b.total} TND</td>
                    <td className="px-5 py-4"><span className={`text-xs ${b.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{b.paymentStatus === 'paid' ? '✓ Payé' : '⏳ En attente'}</span></td>
                    <td className={`px-5 py-4 text-xs font-medium ${STATUS_COLOR[b.status] || 'text-muted'}`}>{LABELS[b.status]}</td>
                    <td className="px-5 py-4">
                      <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)}
                        className="bg-dark-2 border border-gold/15 text-cream text-xs px-2 py-1 outline-none focus:border-gold transition-colors">
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan="9" className="px-5 py-12 text-center text-muted font-light">Aucune réservation trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
