import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import useAuthStore from '../../context/authStore';
import { useLanguage } from '../../context/LanguageContext';

// Sélecteur de langue fin et professionnel
function LanguageToggle({ language, onToggle, wide = false }) {
  const options = ['fr', 'en'];

  return (
    <div
      role="group"
      aria-label="Language"
      className="relative inline-flex items-center rounded-full border border-gold/30 bg-white/[0.03] p-[3px]"
    >
      {/* Indicateur doré qui glisse */}
      <span
        aria-hidden="true"
        className="absolute left-[3px] top-[3px] bottom-[3px] w-[calc((100%-6px)/2)] rounded-full bg-gold transition-transform duration-300 ease-out"
        style={{ transform: language === 'en' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {options.map((code) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => !active && onToggle()}
            className={`relative z-10 ${
              wide ? 'w-14 py-2 text-xs' : 'w-10 py-1.5 text-[10px]'
            } font-semibold uppercase tracking-[2px] transition-colors duration-300 ${
              active ? 'text-dark' : 'text-cream/60 hover:text-gold'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

// Translations for Navbar
const translations = {
  fr: {
    about: 'À propos',
    transfers: 'Transferts',
    excursions: 'Excursions',
    contact: 'Contact',
    login: 'Connexion',
    book: 'Réserver',
    dashboard: 'Mon Tableau de bord',
    logout: 'Déconnexion',
    goTaxi: 'TAXI'
  },
  en: {
    about: 'About',
    transfers: 'Transfers',
    excursions: 'Excursions',
    contact: 'Contact',
    login: 'Login',
    book: 'Book Now',
    dashboard: 'My Dashboard',
    logout: 'Logout',
    goTaxi: 'TAXI'
  }
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/#about',       label: t.about },
    { to: '/#transferts',  label: t.transfers },
    { to: '/excursions',   label: t.excursions },
    { to: '/#contact',     label: t.contact },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? 'bg-dark-DEFAULT/95 backdrop-blur-lg border-b border-gold/10 py-3' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-light tracking-[6px] text-cream uppercase z-50 relative">
          GO<span className="text-gold">{t.goTaxi}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`text-[11px] tracking-[2px] uppercase transition-colors duration-300 ${
                  location.pathname === l.to ? 'text-gold' : 'text-cream/70 hover:text-gold'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side (Auth & Language) - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language Switcher */}
          <LanguageToggle language={language} onToggle={toggleLanguage} />

          {token ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 text-cream/80 hover:text-gold transition-colors"
              >
                <FiUser className="w-4 h-4" />
                <span className="text-[11px] uppercase tracking-wider">{user?.firstName}</span>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-4 bg-dark-2 border border-gold/15 min-w-[200px] py-2 shadow-2xl backdrop-blur-xl">
                  <Link to="/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-xs text-cream/70 hover:text-gold hover:bg-gold/5 transition-all uppercase tracking-widest">
                    <FiUser /> {t.dashboard}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-xs text-cream/70 hover:text-gold hover:bg-gold/5 transition-all w-full text-left uppercase tracking-widest border-t border-white/5">
                    <FiLogOut /> {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/admin/login" className="text-[11px] tracking-[2px] uppercase text-cream/70 hover:text-gold transition-colors">
                {t.login}
              </Link>
              <Link to="#transferts" className="bg-gold hover:bg-gold-light text-dark px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-all transform hover:-translate-y-0.5">
                {t.book}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle (Hamburger) */}
        <button
          className="md:hidden text-cream p-2 z-50 relative"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile menu (Plein écran) */}
      <div className={`fixed inset-0 bg-dark-DEFAULT/98 backdrop-blur-xl z-40 transition-all duration-300 flex flex-col pt-24 px-6 pb-8 overflow-y-auto ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

        {/* Language Switcher Mobile */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <span className="text-sm uppercase tracking-wider text-cream/60">Langue / Language</span>
          <LanguageToggle language={language} onToggle={toggleLanguage} wide />
        </div>

        {/* Liens Mobile */}
        <div className="flex flex-col gap-6 mb-10">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="text-2xl font-serif tracking-[2px] text-cream hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth Mobile */}
        <div className="mt-auto border-t border-white/10 pt-6">
          {!token ? (
            <div className="flex flex-col gap-4">
              <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="text-center text-sm tracking-[3px] uppercase text-gold border border-gold py-3">{t.login}</Link>
              <Link to="#transferts" onClick={() => setMenuOpen(false)} className="bg-gold text-dark text-center py-4 text-sm font-bold uppercase tracking-widest">{t.book}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 text-sm text-gold uppercase tracking-widest border border-gold/30 py-3">
                <FiUser /> {t.dashboard}
              </Link>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex items-center justify-center gap-2 text-sm text-cream/70 uppercase tracking-widest py-3">
                <FiLogOut /> {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}