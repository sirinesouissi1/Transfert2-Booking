// pages/admin/AdminClients.jsx (inchangé, déjà correct)
import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { FiMail, FiPhone, FiCalendar, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await bookingAPI.getAll();
        const bookings = response.data.bookings || [];

        const clientsMap = new Map();
        bookings.forEach((b) => {
          const key = b.email;
          if (!clientsMap.has(key)) {
            clientsMap.set(key, {
              firstName: b.firstName,
              lastName: b.lastName,
              email: b.email,
              phone: b.phone,
              totalBookings: 1,
              lastBooking: b.createdAt,
            });
          } else {
            const existing = clientsMap.get(key);
            existing.totalBookings += 1;
            if (new Date(b.createdAt) > new Date(existing.lastBooking)) {
              existing.lastBooking = b.createdAt;
            }
          }
        });

        setClients(Array.from(clientsMap.values()));
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-light mb-8">Clients</h1>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-muted font-medium">Nom</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Email</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Téléphone</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Réservations</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Dernière activité</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.email} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">{client.firstName} {client.lastName}</td>
                <td className="px-6 py-4">
                  <a href={`mailto:${client.email}`} className="text-gold hover:underline flex items-center gap-2">
                    <FiMail size={14} /> {client.email}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <a href={`tel:${client.phone}`} className="text-cream/70 hover:text-gold flex items-center gap-2">
                    <FiPhone size={14} /> {client.phone}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gold/10 text-gold rounded text-xs">
                    {client.totalBookings}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted text-xs">
                  <FiCalendar className="inline mr-1" />
                  {new Date(client.lastBooking).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/admin/clients/${client.email}`} className="text-gold hover:text-gold-light">
                    <FiEye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}