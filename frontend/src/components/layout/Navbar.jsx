import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import useAuthStore from '../../context/authStore';
import { useLanguage } from '../../context/LanguageContext';

// Custom styled Switch for dark theme
const LanguageSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb': {
        backgroundColor: '#D4AF37',
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1a1a1a',
        border: '1px solid #D4AF37',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#D4AF37',
    width: 32,
    height: 32,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"20\" width=\"20\" viewBox=\"0 0 20 20\"><path fill=\"%23333\" d=\"M10 3C6.13 3 3 6.13 3 10s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.5c-3.03 0-5.5-2.47-5.5-5.5S6.97 4.5 10 4.5 15.5 6.97 15.5 10 13.03 15.5 10 15.5z\"/><path fill=\"%23D4AF37\" d=\"M10 5.5V14.5C12.49 14.5 14.5 12.49 14.5 10S12.49 5.5 10 5.5z\"/></svg>')",
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20 / 2,
    border: '1px solid rgba(255,255,255,0.1)',
  },
}));

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

  const handleLanguageToggle = (event) => {
    toggleLanguage();
  };

  const links = [
    { to: '/#about',    label: t.about },
    { to: '/#transferts',  label: t.transfers },
    { to: '/excursions',  label: t.excursions },
    { to: '/#contact',     label: t.contact },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? 'bg-dark-DEFAULT/95 backdrop-blur-lg border-b border-gold/10 py-3' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-light tracking-[6px] text-cream uppercase">
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

        {/* Right side (Auth & Language) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language Switcher with Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-[10px] uppercase tracking-wider transition-colors ${language === 'fr' ? 'text-gold' : 'text-cream/40'}`}>
              FR
            </span>
            <LanguageSwitch
              checked={language === 'en'}
              onChange={handleLanguageToggle}
              inputProps={{ 'aria-label': 'language toggle' }}
            />
            <span className={`text-[10px] uppercase tracking-wider transition-colors ${language === 'en' ? 'text-gold' : 'text-cream/40'}`}>
              EN
            </span>
          </div>

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
              <Link to="/login" className="text-[11px] tracking-[2px] uppercase text-cream/70 hover:text-gold transition-colors">
                {t.login}
              </Link>
              <Link to="#transferts" className="bg-gold hover:bg-gold-light text-dark px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-all transform hover:-translate-y-0.5">
                {t.book}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-cream" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-dark-DEFAULT border-b border-gold/10 px-6 py-8 flex flex-col gap-6 animate-fade-in">
          {/* Language Switcher in Mobile */}
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase tracking-wider text-cream/60">Langue</span>
            <div className="flex items-center gap-3">
              <span className={`text-xs uppercase tracking-wider transition-colors ${language === 'fr' ? 'text-gold' : 'text-cream/40'}`}>
                FR
              </span>
              <LanguageSwitch
                checked={language === 'en'}
                onChange={handleLanguageToggle}
                inputProps={{ 'aria-label': 'language toggle' }}
              />
              <span className={`text-xs uppercase tracking-wider transition-colors ${language === 'en' ? 'text-gold' : 'text-cream/40'}`}>
                EN
              </span>
            </div>
          </div>
          
          <div className="h-[1px] bg-white/5 w-full"></div>
          
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="text-sm tracking-[3px] uppercase text-cream/70 hover:text-gold">
              {l.label}
            </Link>
          ))}
          <div className="h-[1px] bg-white/5 w-full my-2"></div>
          {!token ? (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm tracking-[3px] uppercase text-gold">{t.login}</Link>
              <Link to="#transferts" onClick={() => setMenuOpen(false)} className="bg-gold text-dark text-center py-3 text-sm font-bold uppercase tracking-widest">{t.book}</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-cream/70 uppercase tracking-widest">
              <FiLogOut /> {t.logout}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}