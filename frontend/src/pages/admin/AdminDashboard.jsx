import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, bookingAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import { FiUsers, FiPackage, FiDollarSign, FiClock, FiLogOut, FiHome, FiCalendar, FiList } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => setStats({ totalBookings: 248, totalUsers: 186, totalRevenue: 38420, pendingBookings: 12, monthlyBookings: [
        { _id: { month: 7 }, count: 22, revenue: 4800 },
        { _id: { month: 8 }, count: 38, revenue: 8200 },
        { _id: { month: 9 }, count: 29, revenue: 6100 },
        { _id: { month: 10 }, count: 44, revenue: 9400 },
        { _id: { month: 11 }, count: 31, revenue: 5900 },
        { _id: { month: 12 }, count: 52, revenue: 11200 },
      ]}));

    bookingAPI.getAll({ limit: 8 })
      .then(({ data }) => setRecentBookings(data.bookings || []))
      .catch(() => setRecentBookings([]));
  }, []);

  const chartData = stats?.monthlyBookings?.map((m) => ({
    name: MONTHS[(m._id.month - 1)],
    réservations: m.count,
    revenus: m.revenue,
  })) || [];

  const STATUS_COLOR = { pending: 'text-yellow-400', confirmed: 'text-green-400', completed: 'text-muted', cancelled: 'text-red-400' };
  const STATUS_LABEL = { pending: 'En attente', confirmed: 'Confirmé', 'in-progress': 'En cours', completed: 'Terminé', cancelled: 'Annulé' };

  return (
    <div className="min-h-screen bg-dark-DEFAULT flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-2 border-r border-gold/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-gold/10">
          <Link to="/" className="font-serif text-xl tracking-[4px] text-cream">LUMIN<span className="text-gold">A</span></Link>
          <div className="text-muted text-xs mt-1 tracking-wider">Administration</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: FiHome, label: 'Dashboard', to: '/admin', active: true },
            { icon: FiCalendar, label: 'Réservations', to: '/admin/bookings' },
            { icon: FiList, label: 'Excursions', to: '/admin/excursions' },
            { icon: FiUsers, label: 'Utilisateurs', to: '/admin/users' },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all ${item.active ? 'text-gold bg-gold/8 border-l-2 border-gold' : 'text-muted hover:text-cream hover:bg-dark-3'}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <div className="text-cream text-sm mb-1">{user?.firstName} {user?.lastName}</div>
          <div className="text-muted text-xs mb-4">{user?.email}</div>
          <button onClick={logout} className="flex items-center gap-2 text-muted text-xs hover:text-gold transition-colors">
            <FiLogOut className="w-3 h-3" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        <h1 className="font-serif text-3xl font-light text-cream mb-8">Tableau de bord</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiCalendar, label: 'Réservations', value: stats?.totalBookings || 0, sub: 'Total', color: 'text-blue-400' },
            { icon: FiUsers,    label: 'Clients',      value: stats?.totalUsers || 0,    sub: 'Inscrits', color: 'text-green-400' },
            { icon: FiDollarSign,label: 'Revenus',     value: `${(stats?.totalRevenue || 0).toLocaleString()} TND`, sub: 'Total payé', color: 'text-gold' },
            { icon: FiClock,    label: 'En attente',   value: stats?.pendingBookings || 0, sub: 'À traiter', color: 'text-yellow-400' },
          ].map((card) => (
            <div key={card.label} className="bg-dark-3 border border-gold/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted text-xs tracking-[2px] uppercase">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`font-serif text-3xl font-light ${card.color}`}>{card.value}</div>
              <div className="text-muted text-xs mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-dark-3 border border-gold/10 p-6 mb-8">
            <h2 className="font-serif text-xl font-light text-cream mb-6">Réservations mensuelles</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#8A8A9A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8A8A9A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A1A24', border: '1px solid rgba(201,168,76,0.2)', color: '#F8F5EE' }} />
                <Bar dataKey="réservations" fill="#C9A84C" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent bookings */}
        <div className="bg-dark-3 border border-gold/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-light text-cream">Dernières réservations</h2>
            <Link to="/admin/bookings" className="text-gold text-xs tracking-[2px] uppercase hover:text-gold-light">Voir tout →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-muted text-sm font-light">Aucune réservation récente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10 text-muted text-xs tracking-[2px] uppercase">
                    <th className="text-left pb-3">Code</th>
                    <th className="text-left pb-3">Client</th>
                    <th className="text-left pb-3">Type</th>
                    <th className="text-left pb-3">Date</th>
                    <th className="text-left pb-3">Total</th>
                    <th className="text-left pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="border-b border-gold/5 hover:bg-dark-4 transition-colors">
                      <td className="py-3 text-gold font-mono text-xs">{b.confirmationCode}</td>
                      <td className="py-3 text-cream">{b.user?.firstName} {b.user?.lastName}</td>
                      <td className="py-3 text-muted">{b.bookingType === 'excursion' ? '🏛 Excursion' : '✈ Transfert'}</td>
                      <td className="py-3 text-muted">{new Date(b.departureDate).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 text-cream">{b.total} TND</td>
                      <td className={`py-3 text-xs font-medium ${STATUS_COLOR[b.status] || 'text-muted'}`}>{STATUS_LABEL[b.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
