// components/layout/AdminLayout.jsx
import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import { FiHome, FiUsers, FiTruck, FiMap, FiCalendar, FiLogOut, FiChevronDown } from 'react-icons/fi';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingsOpen, setBookingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/admin', icon: FiHome, label: 'Dashboard' },
    { to: '/admin/clients', icon: FiUsers, label: 'Clients' },
    { to: '/admin/vehicules', icon: FiTruck, label: 'Véhicules' },
    { to: '/admin/excursions', icon: FiMap, label: 'Excursions' },
  ];

  return (
    <div className="flex h-screen bg-dark-DEFAULT text-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-2 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/admin" className="font-serif text-2xl tracking-[4px] text-cream">
            LUMIN<span className="text-gold">A</span> <span className="text-xs text-muted ml-2">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              icon={<link.icon />}
              label={link.label}
              active={isActive(link.to)}
            />
          ))}

          {/* Réservations avec dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded transition-colors ${
                isActive('/admin/reservations')
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
                  to="/admin/reservations/transferts"
                  icon={<span className="text-xs">✈</span>}
                  label="Transferts"
                  active={location.pathname === '/admin/reservations/transferts'}
                  compact
                />
                <NavLink
                  to="/admin/reservations/excursions"
                  icon={<span className="text-xs">🏛</span>}
                  label="Excursions"
                  active={location.pathname === '/admin/reservations/excursions'}
                  compact
                />
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted">
            <span className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
              {user?.firstName?.charAt(0)}
            </span>
            <div className="flex-1 truncate">
              <p className="text-cream text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-gold hover:bg-white/5 rounded w-full transition-colors mt-2"
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
            </span>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Composant NavLink réutilisable
function NavLink({ to, icon, label, active, compact = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
        active
          ? 'bg-gold/10 text-gold border-l-2 border-gold'
          : 'text-muted hover:text-cream hover:bg-white/5'
      } ${compact ? 'text-xs' : ''}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}