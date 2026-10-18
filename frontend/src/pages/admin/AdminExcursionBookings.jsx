// pages/admin/AdminExcursionBookings.jsx
import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api'; // ou excursionBookingAPI

export default function AdminExcursionBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingAPI.getAll();
        const excursions = res.data.bookings.filter(b => b.bookingType === 'excursion');
        setBookings(excursions);
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
      <h1 className="text-3xl font-serif font-light mb-8">Réservations Excursions</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full bg-dark-2 border border-white/5">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Excursion</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Participants</th>
              <th className="p-4 text-left">Prix</th>
              <th className="p-4 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-white/5">
                <td className="p-4 font-mono text-gold">{b.confirmationCode}</td>
                <td className="p-4">{b.firstName} {b.lastName}</td>
                <td className="p-4">{b.excursion?.name || '-'}</td>
                <td className="p-4">{new Date(b.departureDate).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">{b.passengers?.adults || 0} adultes</td>
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