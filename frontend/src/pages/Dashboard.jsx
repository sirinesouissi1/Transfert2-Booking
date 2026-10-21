import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getImageUrl } from '../utils/imageUrl';
import BookingCalendar from '../pages/BookingCalendar';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI, vehicleAPI, excursionAPI, excursionBookingAPI } from '../services/api';
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
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiTag,
  FiArrowRight,
  FiPlus,
  FiCheck,
  FiSave,
  FiImage,
} from 'react-icons/fi';

// URL de l'API (backend Render). Sans cette base, les fetch('/api/...') partent vers le domaine du frontend.
const API_URL = (import.meta.env.VITE_API_URL || 'https://go-taxi-api.onrender.com/api').replace(/\/$/, '');

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

// Helper d'affichage du prix (null / undefined / 0 = "sur demande")
const formatPrice = (value) => {
  if (value === null || value === undefined || Number(value) === 0) {
    return <span className="italic text-muted text-sm">Prix sur demande</span>;
  }
  return <span>{value} €</span>;
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'user';

  const [excursionBookings, setExcursionBookings] = useState([]);
  const [excursionBookingsAll, setExcursionBookingsAll] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  // Modal de création (véhicule / excursion)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createResource, setCreateResource] = useState(null);

  // ---- État pour Prix Véhicule par Destination ----
  const [selectedVehicleForPricing, setSelectedVehicleForPricing] = useState(null);

  // ---- Données pour les graphiques ----
  const bookingsByMonth = useMemo(() => {
    const months = {};
    bookings.forEach(b => {
      const date = new Date(b.departureDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      months[monthYear] = (months[monthYear] || 0) + 1;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const bookingsByStatus = useMemo(() => {
    const statusCount = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => {
      if (statusCount[b.status] !== undefined) statusCount[b.status]++;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const bookingsByType = useMemo(() => {
    const transferts = bookings.filter(b => b.bookingType === 'transfer').length;
    const excursionsCount = bookings.filter(b => b.bookingType === 'excursion').length;
    return [
      { name: 'Transferts', value: transferts },
      { name: 'Excursions', value: excursionsCount }
    ];
  }, [bookings]);

  const STATUS_COLORS = {
    pending: '#F39C12',
    confirmed: '#27AE60',
    completed: '#2C3E50',
    cancelled: '#E74C3C'
  };

  const fetchData = useCallback(async () => {
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

      if (isAdmin) {
        // Clients uniques
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

        const vehiclesRes = await vehicleAPI.getAll();
        setVehicles(vehiclesRes.data.vehicles || []);

        const excursionsRes = await excursionAPI.getAll({ limit: 100 });
        setExcursions(excursionsRes.data.excursions || []);

        const allExcursionBookings = await excursionBookingAPI.getAll();
        setExcursionBookingsAll(allExcursionBookings.data.bookings || []);

        if (currentView === 'excursionBookings') {
          setExcursionBookings(allExcursionBookings.data.bookings || []);
        }
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [currentView, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openViewModal = (resource, item) => {
    setSelectedResource(resource);
    setSelectedItem(item);
    setModalType('view');
    setModalOpen(true);
  };

  const openEditModal = (resource, item) => {
    setSelectedResource(resource);
    setSelectedItem(item);
    setModalType('edit');
    setModalOpen(true);
  };

  const openCreateModal = (resource) => {
    setCreateResource(resource);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateResource(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setSelectedResource(null);
    setModalType(null);
  };

  const handleDelete = async (resource, id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      if (resource === 'vehicle') {
        await vehicleAPI.delete(id);
      } else if (resource === 'excursion') {
        await excursionAPI.delete(id);
      } else if (resource === 'transfer') {
        await bookingAPI.updateStatus(id, { status: 'cancelled' });
      } else if (resource === 'excursionBooking') {
        await excursionAPI.updateBookingStatus(id, { status: 'cancelled' });
      }
      fetchData();
    } catch (err) {
      setError(`Erreur lors de la suppression : ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdate = async (resource, id, data) => {
    try {
      if (resource === 'vehicle') {
        await vehicleAPI.update(id, data);
      } else if (resource === 'excursion') {
        await excursionAPI.update(id, data);
      } else if (resource === 'transfer') {
        await bookingAPI.updateStatus(id, { status: data.status });
      } else if (resource === 'excursionBooking') {
        await excursionAPI.updateBookingStatus(id, { status: data.status });
      }
      fetchData();
      closeModal();
    } catch (err) {
      setError(`Erreur lors de la mise à jour : ${err.response?.data?.message || err.message}`);
    }
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
            GO<span className="text-gold">Taxi</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

          <NavLink
            onClick={() => {
              setCurrentView('vehiculePricing');
              setSelectedVehicleForPricing(null);
            }}
            icon={<FiTag />}
            label="Prix par Destination"
            active={isActive('vehiculePricing')}
          />

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
                  onClick={() => { setCurrentView('transferts'); setBookingsOpen(false); }}
                  icon={<span className="text-xs">✈</span>}
                  label="Transferts"
                  active={isActive('transferts')}
                  compact
                />
                <NavLink
                  onClick={() => { setCurrentView('excursionBookings'); setBookingsOpen(false); }}
                  icon={<span className="text-xs">🏛</span>}
                  label="Excursions"
                  active={isActive('excursionBookings')}
                  compact
                />
              </div>
            )}
          </div>

          <NavLink
            onClick={() => setCurrentView('calendar')}
            icon={<FiCalendar />}
            label="Calendrier"
            active={isActive('calendar')}
          />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total dépensé" value={`${totalSpent} €`} change="+12%" trend="up" icon={<FiDollarSign />} />
                <StatCard title="Réservations" value={totalBookings} change="+5%" trend="up" icon={<FiPackage />} />
                <StatCard title="En attente" value={pendingBookings} change="-2%" trend="down" icon={<FiClock />} />
                <StatCard title="Terminées" value={completedBookings} change="+8%" trend="up" icon={<FiTrendingUp />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-dark-2 border border-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-serif mb-4 text-cream">Évolution des réservations</h3>
                  {bookingsByMonth.length === 0 ? (
                    <p className="text-muted text-sm">Aucune donnée disponible</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bookingsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#aaa" tick={{ fill: '#aaa' }} />
                        <YAxis stroke="#aaa" />
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#C9A84C', color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={2} name="Réservations" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-dark-2 border border-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-serif mb-4 text-cream">Réservations par statut</h3>
                  {bookingsByStatus.every(item => item.value === 0) ? (
                    <p className="text-muted text-sm">Aucune donnée disponible</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={bookingsByStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {bookingsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#C9A84C'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#C9A84C' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-dark-2 border border-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-serif mb-4 text-cream">Type de réservations</h3>
                  {bookingsByType.every(item => item.value === 0) ? (
                    <p className="text-muted text-sm">Aucune donnée disponible</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsByType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A24', borderColor: '#C9A84C' }} />
                        <Legend />
                        <Bar dataKey="value" fill="#C9A84C" name="Nombre de réservations" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-dark-2 border border-white/5 p-6 rounded-lg">
                  <h3 className="text-lg font-serif mb-4 text-cream">Dernières réservations</h3>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="bg-dark-3 h-12 animate-pulse rounded" />)}
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted text-sm">Aucune réservation</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b._id} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <div>
                            <div className="text-sm font-medium text-cream">
                              {b.bookingType === 'excursion' ? b.excursion?.name : `${b.from} → ${b.to}`}
                            </div>
                            <div className="text-xs text-muted">
                              {new Date(b.departureDate).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gold">
                              {formatPrice(b.total ?? b.totalPrice)}
                            </div>
                            <div className={`text-xs ${STATUS_STYLES[b.status]?.split(' ')[0] || 'text-muted'}`}>
                              {STATUS_LABELS[b.status]}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                            <div className="font-serif text-xl text-gold">
                              {formatPrice(b.total ?? b.totalPrice)}
                            </div>
                            <div className={`text-xs border px-2 py-0.5 mt-1 ${STATUS_STYLES[b.status] || ''}`}>
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
            <ClientList clients={clients} loading={loading} isAdmin={isAdmin} onView={(client) => openViewModal('client', client)} />
          )}

          {currentView === 'vehicules' && (
            <VehicleList
              vehicles={vehicles}
              loading={loading}
              isAdmin={isAdmin}
              onCreate={() => openCreateModal('vehicle')}
              onView={(vehicle) => openViewModal('vehicle', vehicle)}
              onEdit={(vehicle) => openEditModal('vehicle', vehicle)}
              onDelete={(id) => handleDelete('vehicle', id)}
            />
          )}

          {currentView === 'excursions' && (
            <ExcursionList
              excursions={excursions}
              loading={loading}
              isAdmin={isAdmin}
              onCreate={() => openCreateModal('excursion')}
              onView={(excursion) => openViewModal('excursion', excursion)}
              onEdit={(excursion) => openEditModal('excursion', excursion)}
              onDelete={(id) => handleDelete('excursion', id)}
            />
          )}

          {currentView === 'vehiculePricing' && (
            <VehiclePricingView
              vehicles={vehicles}
              loading={loading}
              isAdmin={isAdmin}
              selectedVehicle={selectedVehicleForPricing}
              onSelectVehicle={setSelectedVehicleForPricing}
            />
          )}

          {currentView === 'transferts' && (
            <TransferList
              bookings={bookings.filter(b => b.bookingType === 'transfer')}
              loading={loading}
              isAdmin={isAdmin}
              onView={(transfer) => openViewModal('transfer', transfer)}
              onEdit={(transfer) => openEditModal('transfer', transfer)}
              onDelete={(id) => handleDelete('transfer', id)}
            />
          )}

          {currentView === 'excursionBookings' && (
            <ExcursionBookingList
              bookings={excursionBookings}
              loading={loading}
              isAdmin={isAdmin}
              onView={(booking) => openViewModal('excursionBooking', booking)}
              onEdit={(booking) => openEditModal('excursionBooking', booking)}
              onDelete={(id) => handleDelete('excursionBooking', id)}
            />
          )}

          {currentView === 'calendar' && (
            <BookingCalendar
              bookings={bookings}
              excursionBookings={excursionBookingsAll}
              vehicles={vehicles}
              excursions={excursions}
              onRefresh={fetchData}
            />
          )}
        </div>
      </main>

      {modalOpen && (
        <ResourceModal
          resource={selectedResource}
          item={selectedItem}
          type={modalType}
          onClose={closeModal}
          onUpdate={handleUpdate}
          isAdmin={isAdmin}
        />
      )}

      {createModalOpen && createResource && (
        <CreateResourceModal
          resource={createResource}
          onClose={closeCreateModal}
          onCreated={() => {
            closeCreateModal();
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Composants
// ------------------------------------------------------------------

function VehiclePricingView({ vehicles, loading, isAdmin, selectedVehicle, onSelectVehicle }) {
  if (loading) return <div className="text-center py-12 text-muted">Chargement des véhicules...</div>;

  if (!selectedVehicle) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-cream">Prix par Destination</h1>
          <p className="text-muted text-sm mt-1">Sélectionnez un véhicule pour gérer ses tarifs par trajet</p>
        </div>
        {vehicles.length === 0 ? (
          <div className="bg-dark-2 border border-gold/10 p-12 text-center rounded">
            <FiTruck className="text-gold mx-auto mb-3" size={32} />
            <p className="text-muted">Aucun véhicule disponible.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map((v) => (
              <VehicleCard key={v._id} vehicle={v} onClick={() => onSelectVehicle(v)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <VehicleDestinationPricing
      vehicle={selectedVehicle}
      isAdmin={isAdmin}
      onBack={() => onSelectVehicle(null)}
    />
  );
}

function VehicleCard({ vehicle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-dark-2 border border-white/5 hover:border-gold/30 rounded-lg overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-0.5"
    >
      <div className="relative h-36 bg-dark-3 overflow-hidden">
        {vehicle.image ? (
          <img
            src={getImageUrl(vehicle.image)}
            alt={vehicle.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiTruck className="text-gold/30" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2/80 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-cream font-medium text-sm group-hover:text-gold transition-colors">{vehicle.name}</h3>
        <p className="text-muted text-xs mt-1 line-clamp-2">{vehicle.description || 'Aucune description'}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gold/70 border border-gold/20 px-2 py-0.5 rounded">
            {vehicle.capacity ? `${vehicle.capacity} pers.` : '-'}
          </span>
          <span className="text-xs text-muted group-hover:text-gold transition-colors flex items-center gap-1">
            Voir tarifs <FiArrowRight size={11} />
          </span>
        </div>
      </div>
    </button>
  );
}

function VehicleDestinationPricing({ vehicle, isAdmin, onBack }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ from: '', to: '', tripType: 'one_way', price: '' });
  const [addError, setAddError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/prices?vehicleId=${vehicle._id}`);
      const data = await res.json();
      const vehiclePrices = (data.prices || []).filter(
        (p) => (p.vehicle?._id || p.vehicle) === vehicle._id
      );
      setPrices(vehiclePrices);
    } catch (err) {
      console.error('Erreur chargement prix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle._id]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleAdd = async () => {
    if (!addForm.from.trim() || !addForm.to.trim() || !addForm.price) {
      setAddError('Tous les champs sont obligatoires.');
      return;
    }
    if (isNaN(Number(addForm.price)) || Number(addForm.price) <= 0) {
      setAddError('Le prix doit être un nombre positif.');
      return;
    }
    setAddError('');
    try {
      const res = await fetch(`${API_URL}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: vehicle._id,
          from: addForm.from.trim(),
          to: addForm.to.trim(),
          tripType: addForm.tripType,
          price: Number(addForm.price),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.message || 'Erreur lors de l\'ajout');
        return;
      }
      setAddForm({ from: '', to: '', tripType: 'one_way', price: '' });
      await fetchPrices();
      showSuccess('Tarif ajouté avec succès.');
    } catch (err) {
      setAddError('Erreur réseau.');
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({ from: p.from, to: p.to, tripType: p.tripType, price: p.price });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.from.trim() || !editForm.to.trim() || !editForm.price) return;
    try {
      await fetch(`${API_URL}/prices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: editForm.from.trim(),
          to: editForm.to.trim(),
          tripType: editForm.tripType,
          price: Number(editForm.price),
        }),
      });
      setEditingId(null);
      await fetchPrices();
      showSuccess('Tarif mis à jour.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce tarif ?')) return;
    try {
      await fetch(`${API_URL}/prices/${id}`, { method: 'DELETE' });
      await fetchPrices();
      showSuccess('Tarif supprimé.');
    } catch (err) {
      console.error(err);
    }
  };

  const TRIP_LABELS = { one_way: 'Aller simple', round_trip: 'Aller-retour' };
  const TRIP_STYLES = {
    one_way: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    round_trip: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-muted hover:text-gold transition-colors text-sm">
          <span className="text-lg">←</span><span>Retour</span>
        </button>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-3">
          {vehicle.image && (
            <img
              src={getImageUrl(vehicle.image)}
              alt={vehicle.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="h-9 w-9 object-cover rounded border border-white/10"
            />
          )}
          <div>
            <h1 className="text-2xl font-serif text-cream">{vehicle.name}</h1>
            <p className="text-muted text-xs">Gestion des tarifs par destination</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-sm">
          <FiCheck size={15} /> {successMsg}
        </div>
      )}

      {isAdmin && (
        <div className="bg-dark-2 border border-white/5 rounded-lg p-6 mb-6">
          <h2 className="text-base font-serif text-cream mb-4 flex items-center gap-2">
            <FiPlus className="text-gold" size={16} />
            Ajouter un nouveau tarif
          </h2>
          {addError && <p className="text-red-400 text-xs mb-3">{addError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-muted mb-1">De</label>
              <input
                type="text" placeholder="Ex: Tunis"
                value={addForm.from}
                onChange={(e) => setAddForm({ ...addForm, from: e.target.value })}
                className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder-muted/40 focus:outline-none focus:border-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">À</label>
              <input
                type="text" placeholder="Ex: Hammamet"
                value={addForm.to}
                onChange={(e) => setAddForm({ ...addForm, to: e.target.value })}
                className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder-muted/40 focus:outline-none focus:border-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Type de voyage</label>
              <select
                value={addForm.tripType}
                onChange={(e) => setAddForm({ ...addForm, tripType: e.target.value })}
                className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
              >
                <option value="one_way">Aller simple</option>
                <option value="round_trip">Aller-retour</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Prix (€)</label>
              <input
                type="number" placeholder="Ex: 150"
                value={addForm.price}
                onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder-muted/40 focus:outline-none focus:border-gold/40"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 bg-gold text-dark-2 px-4 py-2 rounded text-sm font-medium hover:bg-gold/90 transition-colors"
            >
              <FiPlus size={15} /> Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="bg-dark-2 border border-white/5 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-serif text-cream">
            Tarifs ({prices.length} destination{prices.length !== 1 ? 's' : ''})
          </h2>
          <span className="text-xs text-muted">{vehicle.name}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted text-sm">Chargement des tarifs...</div>
        ) : prices.length === 0 ? (
          <div className="p-12 text-center">
            <FiTag className="text-gold/20 mx-auto mb-3" size={32} />
            <p className="text-muted text-sm">Aucun tarif défini pour ce véhicule.</p>
            {isAdmin && <p className="text-muted/50 text-xs mt-1">Utilisez le formulaire ci-dessus pour en ajouter.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-3 border-b border-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-muted font-medium text-xs uppercase tracking-wider">De</th>
                  <th className="px-6 py-3 text-left text-muted font-medium text-xs uppercase tracking-wider">À</th>
                  <th className="px-6 py-3 text-left text-muted font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-muted font-medium text-xs uppercase tracking-wider">Prix (€)</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    {editingId === p._id ? (
                      <>
                        <td className="px-6 py-3">
                          <input value={editForm.from} onChange={(e) => setEditForm({ ...editForm, from: e.target.value })}
                            className="bg-dark-3 border border-gold/30 rounded px-2 py-1 text-cream text-sm w-full focus:outline-none" />
                        </td>
                        <td className="px-6 py-3">
                          <input value={editForm.to} onChange={(e) => setEditForm({ ...editForm, to: e.target.value })}
                            className="bg-dark-3 border border-gold/30 rounded px-2 py-1 text-cream text-sm w-full focus:outline-none" />
                        </td>
                        <td className="px-6 py-3">
                          <select value={editForm.tripType} onChange={(e) => setEditForm({ ...editForm, tripType: e.target.value })}
                            className="bg-dark-3 border border-gold/30 rounded px-2 py-1 text-cream text-sm focus:outline-none">
                            <option value="one_way">Aller simple</option>
                            <option value="round_trip">Aller-retour</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="bg-dark-3 border border-gold/30 rounded px-2 py-1 text-cream text-sm w-24 focus:outline-none" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => saveEdit(p._id)} className="p-1 text-green-400 hover:text-green-300"><FiCheck size={17} /></button>
                            <button onClick={cancelEdit} className="p-1 text-muted hover:text-cream"><FiX size={17} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3 text-cream">{p.from}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <FiArrowRight className="text-gold/40" size={13} />
                            <span className="text-cream">{p.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs border px-2 py-0.5 rounded ${TRIP_STYLES[p.tripType]}`}>
                            {TRIP_LABELS[p.tripType]}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-gold font-medium">{p.price}</span>
                          <span className="text-muted text-xs ml-1">€</span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => startEdit(p)} className="p-1 text-muted hover:text-gold"><FiEdit2 size={16} /></button>
                              <button onClick={() => handleDelete(p._id)} className="p-1 text-muted hover:text-red-400"><FiTrash2 size={16} /></button>
                            </div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ onView, onEdit, onDelete, isAdmin }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onView} className="p-1 text-muted hover:text-gold transition-colors" title="Voir">
        <FiEye size={18} />
      </button>
      {isAdmin && onEdit && (
        <button onClick={onEdit} className="p-1 text-muted hover:text-gold transition-colors" title="Modifier">
          <FiEdit2 size={18} />
        </button>
      )}
      {isAdmin && onDelete && (
        <button onClick={onDelete} className="p-1 text-muted hover:text-red-400 transition-colors" title="Supprimer">
          <FiTrash2 size={18} />
        </button>
      )}
    </div>
  );
}

function ClientList({ clients, loading, isAdmin, onView }) {
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
              <th className="px-6 py-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.email} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">{client.firstName} {client.lastName}</td>
                <td className="px-6 py-4">
                  <a href={`mailto:${client.email}`} className="text-gold hover:underline">{client.email}</a>
                </td>
                <td className="px-6 py-4">
                  <a href={`tel:${client.phone}`} className="text-cream/70 hover:text-gold">{client.phone}</a>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gold/10 text-gold rounded text-xs">{client.totalBookings}</span>
                </td>
                <td className="px-6 py-4 text-muted text-xs">
                  {new Date(client.lastBooking).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <ActionButtons onView={() => onView(client)} isAdmin={isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VehicleList({ vehicles, loading, isAdmin, onCreate, onView, onEdit, onDelete }) {
  if (loading) return <div className="text-center py-12">Chargement des véhicules...</div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Véhicules</h1>
        {isAdmin && (
          <button
            onClick={onCreate}
            className="bg-gold text-dark-2 px-4 py-2 rounded text-sm font-medium hover:bg-gold/90 transition-colors flex items-center gap-2"
          >
            <FiPlus size={15} /> Ajouter un véhicule
          </button>
        )}
      </div>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-muted font-medium">Image</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Nom</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Description</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Prix</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Capacité</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">
                  {v.image ? (
                    <img
                      src={getImageUrl(v.image)}
                      alt={v.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-dark-3 rounded flex items-center justify-center">
                      <FiTruck className="text-gold/30" size={18} />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{v.name}</td>
                <td className="px-6 py-4 text-muted max-w-xs truncate">{v.description}</td>
                <td className="px-6 py-4 text-gold">{formatPrice(v.price)}</td>
                <td className="px-6 py-4 text-muted">{v.capacity ? `${v.capacity} pers.` : '-'}</td>
                <td className="px-6 py-4">
                  <ActionButtons onView={() => onView(v)} onEdit={() => onEdit(v)} onDelete={() => onDelete(v._id)} isAdmin={isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExcursionList({ excursions, loading, isAdmin, onCreate, onView, onEdit, onDelete }) {
  if (loading) return <div className="text-center py-12">Chargement des excursions...</div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Excursions</h1>
        {isAdmin && (
          <button
            onClick={onCreate}
            className="bg-gold text-dark-2 px-4 py-2 rounded text-sm font-medium hover:bg-gold/90 transition-colors flex items-center gap-2"
          >
            <FiPlus size={15} /> Ajouter une excursion
          </button>
        )}
      </div>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-muted font-medium">Image</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Nom</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Destination</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Durée</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Prix/pers (€)</th>
              <th className="px-6 py-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {excursions.map((e) => (
              <tr key={e._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">
                  <img
                    src={getImageUrl(e.coverImage)}
                    alt={e.name}
                    onError={(ev) => {
                      ev.currentTarget.src =
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80';
                    }}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{e.name}</td>
                <td className="px-6 py-4 text-muted">{e.destination}</td>
                <td className="px-6 py-4 text-muted">{e.duration}</td>
                <td className="px-6 py-4 text-gold">{e.pricePerPerson}</td>
                <td className="px-6 py-4">
                  <ActionButtons onView={() => onView(e)} onEdit={() => onEdit(e)} onDelete={() => onDelete(e._id)} isAdmin={isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransferList({ bookings, loading, isAdmin, onView, onEdit, onDelete }) {
  if (loading) return <div className="text-center py-12">Chargement des transferts...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Réservations Transferts</h1>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="p-4 text-left text-muted font-medium">Code</th>
              <th className="p-4 text-left text-muted font-medium">Client</th>
              <th className="p-4 text-left text-muted font-medium">Trajet</th>
              <th className="p-4 text-left text-muted font-medium">Date</th>
              <th className="p-4 text-left text-muted font-medium">Véhicule</th>
              <th className="p-4 text-left text-muted font-medium">Prix</th>
              <th className="p-4 text-left text-muted font-medium">Statut</th>
              <th className="p-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-gold">{b.confirmationCode}</td>
                <td className="p-4">{b.firstName} {b.lastName}</td>
                <td className="p-4">{b.from} → {b.to}</td>
                <td className="p-4">{new Date(b.departureDate).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">{b.vehicle?.name || '-'}</td>
                <td className="p-4">{formatPrice(b.totalPrice ?? b.total)}</td>
                <td className="p-4">
                  <span className={`text-xs border px-2 py-1 ${STATUS_STYLES[b.status] || ''}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                <td className="p-4">
                  <ActionButtons onView={() => onView(b)} onEdit={() => onEdit(b)} onDelete={() => onDelete(b._id)} isAdmin={isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExcursionBookingList({ bookings, loading, isAdmin, onView, onEdit, onDelete }) {
  if (loading) return <div className="text-center py-12">Chargement des réservations d'excursions...</div>;
  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Réservations Excursions</h1>
      <div className="bg-dark-2 border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-3 border-b border-white/5">
            <tr>
              <th className="p-4 text-left text-muted font-medium">Code</th>
              <th className="p-4 text-left text-muted font-medium">Client</th>
              <th className="p-4 text-left text-muted font-medium">Excursion</th>
              <th className="p-4 text-left text-muted font-medium">Date préférée</th>
              <th className="p-4 text-left text-muted font-medium">Taille du groupe</th>
              <th className="p-4 text-left text-muted font-medium">Prix</th>
              <th className="p-4 text-left text-muted font-medium">Statut</th>
              <th className="p-4 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-gold">{b.confirmationCode}</td>
                <td className="p-4">{b.firstName} {b.lastName}</td>
                <td className="p-4">{b.excursion?.name || '-'}</td>
                <td className="p-4">{new Date(b.preferredDate).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">{b.groupSize} pers.</td>
                <td className="p-4">{formatPrice(b.totalPrice ?? b.total)}</td>
                <td className="p-4">
                  <span className={`text-xs border px-2 py-1 ${STATUS_STYLES[b.status] || ''}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </td>
                <td className="p-4">
                  <ActionButtons onView={() => onView(b)} onEdit={() => onEdit(b)} onDelete={() => onDelete(b._id)} isAdmin={isAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Modal VUE / ÉDITION (avec upload image pour véhicule & excursion)
// ------------------------------------------------------------------
function ResourceModal({ resource, item, type, onClose, onUpdate, isAdmin }) {
  const [formData, setFormData] = useState(item || {});
  const [status, setStatus] = useState(item?.status || 'pending');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!item) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setImageFile(null); setImagePreview(null); return; }
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type !== 'edit') return;

    if (resource === 'transfer' || resource === 'excursionBooking') {
      onUpdate(resource, item._id, { status });
      return;
    }

    // Véhicule ou excursion : construire un FormData si image
    if ((resource === 'vehicle' || resource === 'excursion') && imageFile) {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === '_id' || k === '__v' || k === 'image' || k === 'coverImage') return;
        if (k === 'createdAt' || k === 'updatedAt') return;
        if (v === undefined || v === null) return;
        if (typeof v === 'object') return; // ignore nested
        fd.append(k, String(v));
      });
      fd.append(resource === 'vehicle' ? 'image' : 'coverImage', imageFile);
      onUpdate(resource, item._id, fd);
    } else {
      // Pas de nouvelle image : envoyer le json (sans l'ancienne image base64)
      const payload = { ...formData };
      delete payload.image;
      delete payload.coverImage;
      delete payload.createdAt;
      delete payload.updatedAt;
      // Convertir le prix véhicule en number ou null
      if (resource === 'vehicle' && 'price' in payload) {
        payload.price = payload.price === '' || payload.price == null
          ? null
          : Number(payload.price);
      }
      onUpdate(resource, item._id, payload);
    }
  };

  const renderDetails = () => {
    switch (resource) {
      case 'vehicle':
        return (
          <div className="space-y-2 text-sm">
            <p><strong className="text-muted">Nom :</strong> <span className="text-cream">{item.name}</span></p>
            <p><strong className="text-muted">Description :</strong> <span className="text-cream">{item.description}</span></p>
            <p><strong className="text-muted">Prix :</strong> {formatPrice(item.price)}</p>
            <p><strong className="text-muted">Capacité :</strong> <span className="text-cream">{item.capacity} personnes</span></p>
            {item.image && (
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="max-h-40 mt-2 rounded"
              />
            )}
          </div>
        );

      case 'excursion':
        return (
          <div className="space-y-2 text-sm">
            <p><strong className="text-muted">Nom :</strong> <span className="text-cream">{item.name}</span></p>
            <p><strong className="text-muted">Destination :</strong> <span className="text-cream">{item.destination}</span></p>
            <p><strong className="text-muted">Durée :</strong> <span className="text-cream">{item.duration}</span></p>
            <p><strong className="text-muted">Prix par personne :</strong> <span className="text-gold">{item.pricePerPerson} €</span></p>
            <p><strong className="text-muted">Description :</strong> <span className="text-cream">{item.description}</span></p>
            {item.coverImage && (
              <img
                src={getImageUrl(item.coverImage)}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';
                }}
                className="max-h-40 mt-2 rounded"
              />
            )}
          </div>
        );

      case 'client':
        return (
          <div className="space-y-2 text-sm">
            <p><strong className="text-muted">Nom :</strong> <span className="text-cream">{item.firstName} {item.lastName}</span></p>
            <p><strong className="text-muted">Email :</strong> <span className="text-cream">{item.email}</span></p>
            <p><strong className="text-muted">Téléphone :</strong> <span className="text-cream">{item.phone}</span></p>
            <p><strong className="text-muted">Réservations :</strong> <span className="text-gold">{item.totalBookings}</span></p>
            <p><strong className="text-muted">Dernière activité :</strong> <span className="text-cream">{new Date(item.lastBooking).toLocaleDateString('fr-FR')}</span></p>
          </div>
        );

      case 'transfer':
        return (
          <div className="space-y-2 text-sm">
            <p><strong className="text-muted">Code :</strong> <span className="text-gold font-mono">{item.confirmationCode}</span></p>
            <p><strong className="text-muted">Client :</strong> <span className="text-cream">{item.firstName} {item.lastName}</span></p>
            <p><strong className="text-muted">Email :</strong> <span className="text-cream">{item.email}</span></p>
            <p><strong className="text-muted">Téléphone :</strong> <span className="text-cream">{item.phone}</span></p>
            <p><strong className="text-muted">Trajet :</strong> <span className="text-cream">{item.from} → {item.to}</span></p>
            <p><strong className="text-muted">Date :</strong> <span className="text-cream">{new Date(item.departureDate).toLocaleDateString('fr-FR')}</span></p>
            <p><strong className="text-muted">Véhicule :</strong> <span className="text-cream">{item.vehicle?.name || '-'}</span></p>
            <p><strong className="text-muted">Prix :</strong> {formatPrice(item.totalPrice ?? item.total)}</p>
            <p><strong className="text-muted">Statut :</strong> <span className={`text-xs border px-2 py-1 ml-1 ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span></p>
          </div>
        );

      case 'excursionBooking':
        return (
          <div className="space-y-2 text-sm">
            <p><strong className="text-muted">Code :</strong> <span className="text-gold font-mono">{item.confirmationCode}</span></p>
            <p><strong className="text-muted">Client :</strong> <span className="text-cream">{item.firstName} {item.lastName}</span></p>
            <p><strong className="text-muted">Email :</strong> <span className="text-cream">{item.email}</span></p>
            <p><strong className="text-muted">Téléphone :</strong> <span className="text-cream">{item.phone}</span></p>
            <p><strong className="text-muted">Excursion :</strong> <span className="text-cream">{item.excursion?.name}</span></p>
            <p><strong className="text-muted">Date :</strong> <span className="text-cream">{new Date(item.departureDate).toLocaleDateString('fr-FR')}</span></p>
            <p><strong className="text-muted">Participants :</strong> <span className="text-cream">{item.passengers?.adults || 0} adultes</span></p>
            <p><strong className="text-muted">Prix :</strong> {formatPrice(item.totalPrice ?? item.total)}</p>
            <p><strong className="text-muted">Statut :</strong> <span className={`text-xs border px-2 py-1 ml-1 ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span></p>
          </div>
        );

      default:
        return <pre className="text-xs text-muted">{JSON.stringify(item, null, 2)}</pre>;
    }
  };

  const renderEditForm = () => {
    if (resource === 'transfer' || resource === 'excursionBooking') {
      return (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-muted mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted hover:text-cream">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-gold text-dark-2 rounded">Mettre à jour</button>
          </div>
        </form>
      );
    }

    if (resource === 'vehicle') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Nom</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
              className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3"
              className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Prix (€) — vide = sur demande</label>
              <input type="number" min="0" name="price" value={formData.price ?? ''} onChange={handleChange}
                placeholder="Sur demande"
                className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Capacité</label>
              <input type="number" min="0" name="capacity" value={formData.capacity || ''} onChange={handleChange}
                className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm text-muted mb-1">Image</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="w-full bg-dark-3 border border-dashed border-white/20 hover:border-gold/40 rounded px-3 py-2 text-sm text-muted flex items-center gap-2 transition-colors">
                  <FiImage size={16} className="text-gold" />
                  <span className="truncate">
                    {imageFile ? imageFile.name : 'Choisir une nouvelle image…'}
                  </span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {(imagePreview || formData.image) && (
                <div className="relative">
                  <img
                    src={imagePreview || getImageUrl(formData.image)}
                    alt="aperçu"
                    className="h-16 w-16 object-cover rounded border border-white/10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                      title="Retirer"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted hover:text-cream">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-gold text-dark-2 rounded">Enregistrer</button>
          </div>
        </form>
      );
    }

    if (resource === 'excursion') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Nom</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
              className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Destination</label>
              <input type="text" name="destination" value={formData.destination || ''} onChange={handleChange}
                className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Durée</label>
              <input type="text" name="duration" value={formData.duration || ''} onChange={handleChange}
                className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Prix par personne (€)</label>
            <input type="number" name="pricePerPerson" value={formData.pricePerPerson || ''} onChange={handleChange}
              className="w-full bg-dark-3 border border-white/5 rounded px-3 py-2 text-cream" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm text-muted mb-1">Image de couverture</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="w-full bg-dark-3 border border-dashed border-white/20 hover:border-gold/40 rounded px-3 py-2 text-sm text-muted flex items-center gap-2 transition-colors">
                  <FiImage size={16} className="text-gold" />
                  <span className="truncate">
                    {imageFile ? imageFile.name : 'Choisir une nouvelle image…'}
                  </span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {(imagePreview || formData.coverImage) && (
                <div className="relative">
                  <img
                    src={imagePreview || getImageUrl(formData.coverImage)}
                    alt="aperçu"
                    className="h-16 w-16 object-cover rounded border border-white/10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                      title="Retirer"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-muted hover:text-cream">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-gold text-dark-2 rounded">Enregistrer</button>
          </div>
        </form>
      );
    }

    return <p className="text-muted text-sm">Édition non disponible pour cette ressource.</p>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-2 border border-white/5 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-serif">
            {type === 'view' ? 'Détails' : 'Modifier'}{' '}
            {{ vehicle: 'Véhicule', excursion: 'Excursion', client: 'Client', transfer: 'Transfert', excursionBooking: 'Réservation' }[resource]}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-cream"><FiX size={24} /></button>
        </div>
        <div className="p-6">
          {type === 'view' ? renderDetails() : renderEditForm()}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Modal de CRÉATION (Véhicule / Excursion) — Upload depuis l'appareil
// ------------------------------------------------------------------
function CreateResourceModal({ resource, onClose, onCreated }) {
  const isVehicle = resource === 'vehicle';

  const [form, setForm] = useState(
    isVehicle
      ? {
          name: '',
          description: '',
          price: '',          // optionnel → sur demande
          capacity: '',
        }
      : {
          name: '',
          shortDesc: '',
          description: '',
          destination: '',
          duration: '',
          category: 'culture',
          badge: '',
          pricePerPerson: '',
          maxCapacity: 10,
          minPersons: 1,
          isFeatured: false,
        }
  );

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setImageFile(null); setImagePreview(null); return; }
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isVehicle) {
      if (!form.name || !form.description) {
        return setError('Le nom et la description sont obligatoires.');
      }
      if (form.capacity === '' || isNaN(Number(form.capacity))) {
        return setError('La capacité est obligatoire (nombre).');
      }
    } else {
      if (!form.name || !form.description || !form.destination || !form.duration || !form.pricePerPerson) {
        return setError('Veuillez remplir tous les champs obligatoires (*).');
      }
    }

    setSubmitting(true);
    try {
      let res;

      if (isVehicle) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('description', form.description.trim());
        fd.append('capacity', String(Number(form.capacity)));

        // Prix optionnel : si vide → pas envoyé (backend met null)
        if (form.price !== '' && Number(form.price) > 0) {
          fd.append('price', String(Number(form.price)));
        }

        if (imageFile) {
          fd.append('image', imageFile);
        }

        res = await vehicleAPI.create(fd);
      } else {
        // Excursion : FormData aussi (pour envoyer l'image)
        const fd = new FormData();
        fd.append('name', form.name.trim());
        if (form.shortDesc.trim()) fd.append('shortDesc', form.shortDesc.trim());
        fd.append('description', form.description.trim());
        fd.append('destination', form.destination.trim());
        fd.append('duration', form.duration.trim());
        fd.append('category', form.category);
        if (form.badge.trim()) fd.append('badge', form.badge.trim());
        fd.append('pricePerPerson', String(Number(form.pricePerPerson)));
        fd.append('maxCapacity', String(Number(form.maxCapacity) || 10));
        fd.append('minPersons', String(Number(form.minPersons) || 1));
        fd.append('isFeatured', String(form.isFeatured));
        fd.append('isActive', 'true');
        if (imageFile) {
          fd.append('coverImage', imageFile);
        }

        res = await excursionAPI.create(fd);
      }

      if (res.data?.success || res.status === 201 || res.status === 200) {
        onCreated && onCreated();
      } else {
        setError('Création effectuée mais réponse inattendue.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = isVehicle ? 'Ajouter un véhicule' : 'Ajouter une excursion';

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-2 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-dark-2 border-b border-white/5 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-serif text-cream flex items-center gap-2">
            {isVehicle ? <FiTruck className="text-gold" /> : <FiMap className="text-gold" />}
            {title}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-cream">
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          {isVehicle ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Nom *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Description *</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange} rows="3"
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                    Prix (€) <span className="text-muted/60 normal-case">— optionnel</span>
                  </label>
                  <input
                    type="number" min="0" name="price" value={form.price} onChange={handleChange}
                    placeholder="Laisser vide = sur demande"
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder-muted/40 focus:outline-none focus:border-gold/40"
                  />
                  <p className="text-muted text-[10px] mt-1">
                    Vide → affiché comme <span className="text-gold">« Prix sur demande »</span>
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Capacité (pers.) *</label>
                  <input
                    type="number" min="0" name="capacity" value={form.capacity} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>

                {/* Upload image depuis l'appareil */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-dark-3 border border-dashed border-white/20 hover:border-gold/40 rounded px-3 py-3 text-sm text-muted flex items-center gap-2 transition-colors">
                        <FiImage size={16} className="text-gold" />
                        <span className="truncate">
                          {imageFile ? imageFile.name : 'Choisir une image depuis l’appareil…'}
                        </span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="aperçu"
                          className="h-16 w-16 object-cover rounded border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                          title="Retirer"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-muted text-[10px] mt-1">JPG, PNG, WEBP — max 5 Mo</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Nom *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Description courte</label>
                  <input
                    type="text" name="shortDesc" value={form.shortDesc} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Description complète *</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange} rows="4"
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Destination *</label>
                  <input
                    type="text" name="destination" value={form.destination} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Durée *</label>
                  <input
                    type="text" name="duration" value={form.duration} onChange={handleChange}
                    placeholder="Ex: 1 jour, 8h..."
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Catégorie</label>
                  <select
                    name="category" value={form.category} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  >
                    <option value="culture">Culture</option>
                    <option value="nature">Nature</option>
                    <option value="desert">Désert</option>
                    <option value="beach">Plage</option>
                    <option value="city">Ville</option>
                    <option value="roman">Romain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Badge</label>
                  <input
                    type="text" name="badge" value={form.badge} onChange={handleChange}
                    placeholder="Ex: Populaire"
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Prix par personne (€) *</label>
                  <input
                    type="number" min="0" name="pricePerPerson" value={form.pricePerPerson} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Capacité max</label>
                  <input
                    type="number" min="1" name="maxCapacity" value={form.maxCapacity} onChange={handleChange}
                    className="w-full bg-dark-3 border border-white/10 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/40"
                  />
                </div>

                {/* Upload image excursion */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Image de couverture</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-dark-3 border border-dashed border-white/20 hover:border-gold/40 rounded px-3 py-3 text-sm text-muted flex items-center gap-2 transition-colors">
                        <FiImage size={16} className="text-gold" />
                        <span className="truncate">
                          {imageFile ? imageFile.name : 'Choisir une image depuis l’appareil…'}
                        </span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="aperçu" className="h-16 w-16 object-cover rounded border border-white/10" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-muted text-[10px] mt-1">JPG, PNG, WEBP — max 5 Mo</p>
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox" name="isFeatured" id="isFeatured"
                    checked={form.isFeatured} onChange={handleChange}
                    className="accent-gold"
                  />
                  <label htmlFor="isFeatured" className="text-sm text-muted cursor-pointer">
                    Mettre en avant sur la page d'accueil
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Création...' : isVehicle ? 'Créer le véhicule' : "Créer l'excursion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NavLink({ onClick, icon, label, active, compact = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
        active ? 'bg-gold/10 text-gold border-l-2 border-gold' : 'text-muted hover:text-cream hover:bg-white/5'
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