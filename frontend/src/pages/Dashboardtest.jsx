import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI, vehicleAPI, excursionAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import {
  FiHome,
  FiUsers,
  FiTruck,
  FiMap,
  FiCalendar,
  FiLogOut,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiChevronDown,
} from 'react-icons/fi';

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

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [currentView, setCurrentView] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let bookingsData = [];
        if (isAdmin) {
          const res = await bookingAPI.getAll();
          bookingsData = res.data.bookings || [];
        } else {
          const res = await bookingAPI.getMy();
          bookingsData = res.data.bookings || [];
        }
        setBookings(bookingsData);

        if (currentView === 'vehicules') {
          const vehiclesRes = await vehicleAPI.getAll();
          setVehicles(vehiclesRes.data.vehicles || []);
        } else if (currentView === 'excursions') {
          const excursionsRes = await excursionAPI.getAll({ limit: 100 });
          setExcursions(excursionsRes.data.excursions || []);
        } else if (currentView === 'clients') {
          const clientsMap = new Map();
          bookingsData.forEach((b) => {
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
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentView, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((acc, b) => acc + (b.total ?? b.totalPrice ?? 0), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  const isActive = (view) => currentView === view;

  return (
    <div className="flex h-screen bg-dark-DEFAULT text-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-2 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="font-serif text-2xl tracking-[4px] text-cream">
            LUMIN<span className="text-gold">A</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink
            onClick={() => setCurrentView('dashboard')}
            icon={<FiHome />}
            label="Dashboard"
            active={isActive('dashboard')}
          />
          <NavLink
            onClick={() => setCurrentView('clients')}
            icon={<FiUsers />}
            label="Clients"
            active={isActive('clients')}
          />
          <NavLink
            onClick={() => setCurrentView('vehicules')}
            icon={<FiTruck />}
            label="Véhicules"
            active={isActive('vehicules')}
          />
          <NavLink
            onClick={() => setCurrentView('excursions')}
            icon={<FiMap />}
            label="Excursions"
            active={isActive('excursions')}
          />

          {/* Réservations avec dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded transition-colors ${
                isActive('transferts') || isActive('excursionBookings')
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-muted hover:text-cream hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <FiCalendar className="text-lg" />
                <span>Réservations</span>
              </span>
              <FiChevronDown className={`transition-transform ${bookingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {bookingsOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <NavLink
                  onClick={() => {
                    setCurrentView('transferts');
                    setBookingsOpen(false);
                  }}
                  icon={<span className="text-xs">✈</span>}
                  label="Transferts"
                  active={isActive('transferts')}
                  compact
                />
                <NavLink
                  onClick={() => {
                    setCurrentView('excursionBookings');
                    setBookingsOpen(false);
                  }}
                  icon={<span className="text-xs">🏛</span>}
                  label="Excursions"
                  active={isActive('excursionBookings')}
                  compact
                />
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-gold hover:bg-white/5 rounded w-full transition-colors"
          >
            <FiLogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Barre d'en-tête */}
        <div className="sticky top-0 z-10 bg-dark-2 border-b border-white/5 px-8 py-4 flex justify-end items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-cream">
              <span className="text-muted">Bonjour, </span>
              <span className="text-gold font-serif">{user?.firstName}</span>
              {isAdmin && <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">Admin</span>}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-muted hover:text-gold hover:bg-white/5 rounded transition-colors"
              title="Déconnexion"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>

        {/* Contenu conditionnel */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded">
              {error}
            </div>
          )}

          {currentView === 'dashboard' && (
            <>
              <h1 className="text-2xl font-light text-cream mb-8">
                Tableau de bord, <span className="text-gold font-serif">{user?.firstName}</span>
              </h1>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total dépensé"
                  value={`${totalSpent} TND`}
                  change="+12%"
                  trend="up"
                  icon={<FiDollarSign />}
                />
                <StatCard
                  title="Réservations"
                  value={totalBookings}
                  change="+5%"
                  trend="up"
                  icon={<FiPackage />}
                />
                <StatCard
                  title="En attente"
                  value={pendingBookings}
                  change="-2%"
                  trend="down"
                  icon={<FiClock />}
                />
                <StatCard
                  title="Terminées"
                  value={completedBookings}
                  change="+8%"
                  trend="up"
                  icon={<FiTrendingUp />}
                />
              </div>

              {/* Sections supplémentaires (optionnel) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-dark-2 border border-white/5 p-6">
                  <h3 className="text-lg font-serif mb-2">Website View</h3>
                  <p className="text-muted text-sm">Dernière campagne envoyée il y a 2 jours</p>
                  <div className="mt-4 h-32 bg-gradient-to-r from-gold/20 to-transparent rounded" />
                  <p className="text-xs text-muted mt-2">Mis à jour il y a 4 min</p>
                </div>
                <div className="bg-dark-2 border border-white/5 p-6">
                  <h3 className="text-lg font-serif mb-2">Daily Sales</h3>
                  <p className="text-gold text-3xl font-light">+15%</p>
                  <p className="text-muted text-sm mt-2">augmentation par rapport à hier</p>
                </div>
              </div>

              {/* Liste des réservations */}
              <div>
                <h2 className="text-xl font-serif mb-4">
                  {isAdmin ? 'Toutes les réservations' : 'Mes réservations'}
                </h2>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-dark-2 h-20 animate-pulse rounded" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="bg-dark-2 border border-gold/10 p-12 text-center rounded">
                    <p className="text-muted font-light">Aucune réservation trouvée.</p>
                    {!isAdmin && (
                      <Link to="/excursions" className="btn-gold mt-6 inline-block">
                        Découvrir nos excursions
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((b) => (
                      <div
                        key={b._id}
                        className="bg-dark-2 border border-white/5 p-4 rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl text-gold">
                            {b.bookingType === 'excursion' ? '🏛' : '✈'}
                          </div>
                          <div>
                            <div className="text-cream font-medium">
                              {b.excursion?.name || `${b.from} → ${b.to}`}
                            </div>
                            <div className="text-muted text-xs mt-1">
                              Code: <span className="text-gold">{b.confirmationCode}</span> ·{' '}
                              {new Date(b.departureDate).toLocaleDateString('fr-FR')} ·{' '}
                              {typeof b.passengers === 'object'
                                ? (b.passengers.adults + (b.passengers.children || 0))
                                : b.passengers} passager(s)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-serif text-xl text-gold">{b.total ?? b.totalPrice ?? 0} TND</div>
                            <div
                              className={`text-xs border px-2 py-0.5 mt-1 ${
                                STATUS_STYLES[b.status] || ''
                              }`}
                            >
                              {STATUS_LABELS[b.status]}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'clients' && (
            <ClientList clients={clients} loading={loading} />
          )}

          {currentView === 'vehicules' && (
            <VehicleList vehicles={vehicles} loading={loading} />
          )}

          {currentView === 'excursions' && (
            <ExcursionList excursions={excursions} loading={loading} />
          )}

          {currentView === 'transferts' && (
            <TransferList bookings={bookings.filter(b => b.bookingType === 'transfer')} loading={loading} />
          )}

          {currentView === 'excursionBookings' && (
            <ExcursionBookingList bookings={bookings.filter(b => b.bookingType === 'excursion')} loading={loading} />
          )}
        </div>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------
// Composants pour chaque vue
// ------------------------------------------------------------------

function ClientList({ clients, loading }) {
  if (loading) return <div className="text-center py-12">Chargement des clients...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Clients</h1>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-muted font-medium">Nom</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Email</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Téléphone</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Réservations</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Dernière activité</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.email} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">{client.firstName} {client.lastName}</td>
                <td className="px-6 py-4">
                  <a href={`mailto:${client.email}`} className="text-gold hover:underline">
                    {client.email}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <a href={`tel:${client.phone}`} className="text-cream/70 hover:text-gold">
                    {client.phone}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gold/10 text-gold rounded text-xs">
                    {client.totalBookings}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted text-xs">
                  {new Date(client.lastBooking).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VehicleList({ vehicles, loading }) {
  if (loading) return <div className="text-center py-12">Chargement des véhicules...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Véhicules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v._id} className="bg-dark-2 border border-white/5 p-4">
            <img src={v.image} alt={v.name} className="h-32 w-full object-contain mb-4" />
            <h3 className="font-serif text-xl">{v.name}</h3>
            <p className="text-muted text-sm mb-2">{v.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-gold font-bold">{v.price} TND</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExcursionList({ excursions, loading }) {
  if (loading) return <div className="text-center py-12">Chargement des excursions...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Excursions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {excursions.map((e) => (
          <div key={e._id} className="bg-dark-2 border border-white/5 p-4">
            <img src={e.coverImage} alt={e.name} className="h-32 w-full object-cover mb-4" />
            <h3 className="font-serif text-xl">{e.name}</h3>
            <p className="text-muted text-sm mb-2">{e.destination} · {e.duration}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-gold font-bold">{e.pricePerPerson} TND/pers</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransferList({ bookings, loading }) {
  if (loading) return <div className="text-center py-12">Chargement des transferts...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Réservations Transferts</h1>
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
              <td className="p-4">{b.totalPrice ?? b.total ?? 0} TND</td>
              <td className="p-4">
                <span className={`text-xs border px-2 py-1 ${STATUS_STYLES[b.status] || ''}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExcursionBookingList({ bookings, loading }) {
  if (loading) return <div className="text-center py-12">Chargement des réservations d'excursions...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Réservations Excursions</h1>
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
              <td className="p-4">{b.totalPrice ?? b.total ?? 0} TND</td>
              <td className="p-4">
                <span className={`text-xs border px-2 py-1 ${STATUS_STYLES[b.status] || ''}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------
// Composants réutilisables
// ------------------------------------------------------------------

function NavLink({ onClick, icon, label, active, compact = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
        active
          ? 'bg-gold/10 text-gold border-l-2 border-gold'
          : 'text-muted hover:text-cream hover:bg-white/5'
      } ${compact ? 'text-xs' : ''}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, change, trend, icon }) {
  const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400';
  return (
    <div className="bg-dark-2 border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-muted text-sm">{title}</div>
        <div className="text-gold text-xl">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-light text-cream">{value}</div>
        <div className={`text-sm ${trendColor}`}>{change}</div>
      </div>
    </div>
  );
}