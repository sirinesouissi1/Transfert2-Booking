// pages/admin/AdminTransferts.jsx
import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';

const STATUS_STYLES = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  confirmed: 'text-green-400 border-green-400/30 bg-green-400/5',
  'in-progress': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  completed: 'text-muted border-muted/30 bg-muted/5',
  cancelled: 'text-red-400 border-red-400/30 bg-red-400/5',
};
const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function AdminTransferts() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingAPI.getAll();
        // Filtrer les transferts (bookingType = 'transfer')
        const transfers = res.data.bookings.filter(b => b.bookingType === 'transfer');
        setBookings(transfers);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-light mb-8">Réservations Transferts</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full bg-dark-2 border border-white/5">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Trajet</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Véhicule</th>
              <th className="p-4 text-left">Prix</th>
              <th className="p-4 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-white/5">
                <td className="p-4 font-mono text-gold">{b.confirmationCode}</td>
                <td className="p-4">{b.firstName} {b.lastName}</td>
                <td className="p-4">{b.from} → {b.to}</td>
                <td className="p-4">{new Date(b.departureDate).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">{b.vehicle?.name || '-'}</td>
                <td className="p-4">{b.totalPrice} TND</td>
                <td className="p-4">
                  <span className={`text-xs border px-2 py-1 ${STATUS_STYLES[b.status] || ''}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}