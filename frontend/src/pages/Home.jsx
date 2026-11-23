import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Calendar, Users, ArrowRight, ChevronDown, Plane, 
  ShieldCheck, Clock, Star, Wifi, Car, CreditCard, Mail, Phone,
  Globe, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

// Importation des composants globaux
import Navbar from '../components/layout/Navbar'; 
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';
import { contactAPI } from '../services/api'; // <-- AJOUT DE L'API

// ✅ Génère les créneaux horaires toutes les 15 minutes (00:00 → 23:45)
const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

// Translations
const translations = {
  fr: {
    heroTitle: "L'art de",
    heroTitleEm: "voyager",
    heroTitleEnd: "en Tunisie",
    heroDescription: "Découvrez un confort inégalé pour vos transferts aéroports et vos excursions sur mesure.",
    bookingTitle: "Réservation de Transfert",
    oneWay: "Aller Simple",
    roundTrip: "Aller-Retour",
    departure: "Départ",
    destination: "Destination",
    departDate: "Date de Départ",
    returnDate: "Date de Retour",
    checkPrices: "Vérifier les tarifs",
    enterLocation: "Saisir lieu...",
    noResult: "Aucun résultat",
    // ✅ Erreurs de validation du formulaire
    errFrom: "Veuillez choisir un lieu de départ dans la liste.",
    errTo: "Veuillez choisir une destination dans la liste.",
    errSameLocation: "Le départ et la destination doivent être différents.",
    errDepartDate: "Veuillez choisir une date de départ.",
    errDepartTime: "Veuillez choisir une heure de départ.",
    errReturnDate: "Veuillez choisir une date de retour.",
    errReturnTime: "Veuillez choisir une heure de retour.",
    errReturnBefore: "Le retour doit être après le départ.",
    premiumVehicles: "Véhicules Premium",
    premiumDesc: "Une flotte moderne et luxueuse pour un confort absolu durant vos trajets.",
    certifiedDrivers: "Chauffeurs Certifiés",
    certifiedDesc: "Des professionnels ponctuels et bilingues à votre entière disposition.",
    fixedPrices: "Prix Fixes",
    fixedDesc: "Aucun frais caché. Le tarif est fixé lors de votre réservation.",
    whoWeAre: "Qui sommes-nous",
    aboutTitle: "Votre Partenaire de Transport",
    aboutTitleGold: "de Confiance",
    aboutP1: "GoTaxi est une entreprise moderne, dirigée par des jeunes, fondée par un groupe d'amis unis par la passion d'offrir des services de navette privée exceptionnels à travers la Tunisie.",
    aboutP2: "Ensemble, ils cumulent plus d'une décennie d'expérience dans le transport et l'hospitalité. Cette équipe d'individus éduqués, dynamiques et éco-responsables s'engage à proposer des solutions de transport privé à la fois économiques et respectueuses de l'environnement.",
    aboutFooter: "Service 24h/24 et 7j/7 vers tous les aéroports.",
    yearsExperience: "Ans d'expérience",
    ourServices: "Nos Services",
    airportTransfers: "Transferts Aéroport",
    airportDesc: "Services disponibles 24h/24 dans tous les principaux aéroports tunisiens : Tunis Carthage, Enfidha, Monastir et Sfax. Prix fixes garantis.",
    excursions: "Excursions Personnalisées",
    excursionsDesc: "Découvrez la Tunisie avec nos services sur mesure. Des sites historiques aux aventures désertiques, nous créons vos voyages mémorables.",
    learnMore: "En Savoir Plus",
    whyChoose: "Pourquoi Choisir",
    whyChooseGold: "GoTaxi",
    safety: "La Sécurité Avant Tout",
    premiumMinivan: "Minivan Familial Premium",
    punctuality: "Ponctualité Garantie",
    transparentPrices: "Prix Transparents",
    wifiOnboard: "WiFi à Bord",
    professionalDrivers: "Chauffeurs Professionnels",
    comfortableTrips: "Trajets Confortables",
    securePayment: "Paiement Sécurisé",
    contactUs: "Contactez-Nous",
    contactDesc: "Une question ou une demande spécifique ? Notre équipe est à votre écoute 24h/24.",
    fullName: "Nom complet",
    email: "Email",
    subject: "Sujet",
    message: "Votre message",
    send: "Envoyer le message",
    callUs: "Appelez-nous",
    emailUs: "Email",
    sending: "Envoi en cours...",
    sent: "Message envoyé avec succès !",
    error: "Erreur lors de l'envoi du message."
  },
  en: {
    heroTitle: "The art of",
    heroTitleEm: "traveling",
    heroTitleEnd: "in Tunisia",
    heroDescription: "Discover unparalleled comfort for your airport transfers and custom excursions.",
    bookingTitle: "Transfer Booking",
    oneWay: "One Way",
    roundTrip: "Round Trip",
    departure: "Departure",
    destination: "Destination",
    departDate: "Departure Date",
    returnDate: "Return Date",
    checkPrices: "Check Prices",
    enterLocation: "Enter location...",
    noResult: "No results",
    // ✅ Form validation errors
    errFrom: "Please choose a departure location from the list.",
    errTo: "Please choose a destination from the list.",
    errSameLocation: "Departure and destination must be different.",
    errDepartDate: "Please choose a departure date.",
    errDepartTime: "Please choose a departure time.",
    errReturnDate: "Please choose a return date.",
    errReturnTime: "Please choose a return time.",
    errReturnBefore: "The return must be after the departure.",
    premiumVehicles: "Premium Vehicles",
    premiumDesc: "A modern and luxurious fleet for absolute comfort during your journeys.",
    certifiedDrivers: "Certified Drivers",
    certifiedDesc: "Punctual and bilingual professionals at your complete disposal.",
    fixedPrices: "Fixed Prices",
    fixedDesc: "No hidden fees. The price is set when you book.",
    whoWeAre: "Who We Are",
    aboutTitle: "Your Trusted",
    aboutTitleGold: "Transport Partner",
    aboutP1: "GoTaxi is a modern, youth-led company founded by a group of friends united by the passion to offer exceptional private shuttle services across Tunisia.",
    aboutP2: "Together, they have over a decade of experience in transportation and hospitality. This team of educated, dynamic, and eco-conscious individuals is committed to offering private transport solutions that are both economical and environmentally friendly.",
    aboutFooter: "24/7 service to all airports.",
    yearsExperience: "Years Experience",
    ourServices: "Our Services",
    airportTransfers: "Airport Transfers",
    airportDesc: "24/7 services available at all major Tunisian airports: Tunis Carthage, Enfidha, Monastir, and Sfax. Fixed prices guaranteed.",
    excursions: "Custom Excursions",
    excursionsDesc: "Discover Tunisia with our tailor-made services. From historical sites to desert adventures, we create your memorable journeys.",
    learnMore: "Learn More",
    whyChoose: "Why Choose",
    whyChooseGold: "GoTaxi",
    safety: "Safety First",
    premiumMinivan: "Premium Family Minivan",
    punctuality: "Guaranteed Punctuality",
    transparentPrices: "Transparent Prices",
    wifiOnboard: "WiFi Onboard",
    professionalDrivers: "Professional Drivers",
    comfortableTrips: "Comfortable Trips",
    securePayment: "Secure Payment",
    contactUs: "Contact Us",
    contactDesc: "A question or specific request? Our team is available 24/7.",
    fullName: "Full Name",
    email: "Email",
    subject: "Subject",
    message: "Your Message",
    send: "Send Message",
    callUs: "Call Us",
    emailUs: "Email",
    sending: "Sending...",
    sent: "Message sent successfully!",
    error: "Error sending message."
  }
};

export default function Home() {
  const { hash } = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  // Gestion du défilement automatique si l'URL contient un # (ex: /#about)
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="bg-dark-DEFAULT min-h-screen font-sans text-cream selection:bg-gold selection:text-dark">
      
      <main>
        {/* 1. SECTION HERO (RECHERCHE) */}
        <Hero t={t} language={language} />

        {/* SECTION DES CARDS RAPIDES (Feature) */}
        <section className="py-12 bg-dark-DEFAULT px-6 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <Feature 
                title={t.premiumVehicles}
                description={t.premiumDesc}
              />
              <Feature 
                title={t.certifiedDrivers}
                description={t.certifiedDesc}
              />
              <Feature 
                title={t.fixedPrices}
                description={t.fixedDesc}
              />
            </div>
          </div>
        </section>

        {/* 2. SECTION À PROPOS (ID: about) */}
        <section id="about" className="py-16 sm:py-24 bg-dark-DEFAULT px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
              <div className="relative group overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Luxe Transport Tunisia" 
                  className="rounded-sm shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute -bottom-6 -right-6 bg-gold p-8 hidden md:block">
                  <span className="text-dark font-serif text-4xl font-bold">10+</span>
                  <p className="text-dark text-xs uppercase tracking-widest font-bold">{t.yearsExperience}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-gold uppercase tracking-[4px] text-xs font-bold">{t.whoWeAre}</h3>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
                  {t.aboutTitle} <br /> <span className="text-gold">{t.aboutTitleGold}</span>
                </h2>
                <p className="text-cream/70 leading-relaxed text-lg italic">
                  {t.aboutP1}
                </p>
                <p className="text-cream/60 leading-relaxed">
                  {t.aboutP2}
                </p>
                <div className="flex items-center gap-4 text-gold border-l-2 border-gold pl-6 py-2">
                  <p className="text-sm uppercase tracking-widest">{t.aboutFooter}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION NOS SERVICES */}
        <section id="services" className="py-16 sm:py-24 bg-dark-2 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto text-center mb-10 sm:mb-16">
            <h3 className="text-gold uppercase tracking-[4px] text-xs font-bold mb-4">GoTaxi Service</h3>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">{t.ourServices}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ServiceCard 
              icon={<Plane size={32} />}
              title={t.airportTransfers}
              description={t.airportDesc}
              image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800"
              learnMore={t.learnMore}
            />
            <ServiceCard 
              icon={<MapPin size={32} />}
              title={t.excursions}
              description={t.excursionsDesc}
              image="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800"
              learnMore={t.learnMore}
            />
          </div>
        </section>

        {/* 4. SECTION POURQUOI NOUS CHOISIR */}
        <section className="py-16 sm:py-24 bg-dark-DEFAULT px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4">{t.whyChoose} <span className="text-gold">{t.whyChooseGold}</span></h2>
              <div className="w-24 h-1 bg-gold mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              <WhyFeature icon={<ShieldCheck size={30}/>} text={t.safety} />
              <WhyFeature icon={<Car size={30}/>} text={t.premiumMinivan} />
              <WhyFeature icon={<Clock size={30}/>} text={t.punctuality} />
              <WhyFeature icon={<Star size={30}/>} text={t.transparentPrices} />
              <WhyFeature icon={<Wifi size={30}/>} text={t.wifiOnboard} />
              <WhyFeature icon={<Users size={30}/>} text={t.professionalDrivers} />
              <WhyFeature icon={<Star size={30}/>} text={t.comfortableTrips} />
              <WhyFeature icon={<CreditCard size={30}/>} text={t.securePayment} />
            </div>
          </div>
        </section>

        {/* 5. SECTION CONTACT & MAP (ID: contact) */}
        <ContactSection t={t} />
      </main>

    </div>
  );
}

// --- COMPOSANT CONTACT (Isolé pour gérer le formulaire) ---
function ContactSection({ t }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await contactAPI.send(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-dark-2 scroll-mt-20 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Map */}
        <div className="h-[260px] sm:h-[400px] lg:h-auto sm:min-h-[500px] grayscale contrast-125 opacity-50">
          <iframe 
            title="Tunisia Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3234.332306894056!2d10.634584!3d35.824503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130238a67d65755d%3A0xcd6467a3afcdc0d!2sSousse%2C%20Tunisia!5e0!3m2!1sen!2stn!4v1700000000000!5m2!1sen!2stn"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
          ></iframe>
        </div>

        {/* Formulaire */}
        <div className="p-6 sm:p-12 lg:p-20 space-y-6 sm:space-y-8 bg-dark-2">
          <h2 className="font-serif text-3xl sm:text-4xl">{t.contactUs}</h2>
          <p className="text-cream/60">{t.contactDesc}</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t.fullName} 
                className="w-full bg-white/5 border border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 outline-none focus:border-gold transition-colors text-cream" 
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t.email} 
                className="w-full bg-white/5 border border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 outline-none focus:border-gold transition-colors text-cream" 
              />
            </div>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t.subject} 
              className="w-full bg-white/5 border border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 outline-none focus:border-gold transition-colors text-cream" 
            />
            <textarea 
              rows="4" 
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder={t.message} 
              className="w-full bg-white/5 border border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 outline-none focus:border-gold transition-colors text-cream resize-none"
            ></textarea>

            {/* Message de succès ou d'erreur */}
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded">
                <CheckCircle2 size={18} /> {t.sent}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="bg-gold text-dark font-bold uppercase tracking-widest px-10 py-4 hover:bg-gold-light transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> {t.sending}
                </>
              ) : (
                t.send
              )}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 flex items-center justify-center rounded-full text-gold"><Phone size={20}/></div>
              <div><p className="text-[10px] uppercase text-gold">{t.callUs}</p><p className="text-sm">+216 53 078 293</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 flex items-center justify-center rounded-full text-gold"><Mail size={20}/></div>
              <div><p className="text-[10px] uppercase text-gold">{t.emailUs}</p><p className="text-sm">gotaxitunisie0@gmail.com</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- SOUS-COMPOSANT HERO (AVEC LOGIQUE D'ICONES DANS LE DROPDOWN) ---

function Hero({ t, language }) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');
  const [formData, setFormData] = useState({ 
    from: '', 
    to: '', 
    departDate: '',   // YYYY-MM-DD
    departTime: '',   // HH:mm
    returnDate: '',   // YYYY-MM-DD
    returnTime: '',   // HH:mm
    passengers: 1
  });

  // ✅ NOUVEAU : erreurs de validation par champ
  const [errors, setErrors] = useState({});
  const clearError = (...keys) =>
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  // ✅ date minimale (aujourd'hui) pour bloquer les dates passées
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const todayStr = minDateTime.slice(0, 10); // YYYY-MM-DD

  // ✅ filtre les créneaux si la date choisie est aujourd'hui (retire les heures passées)
  const getAvailableSlots = (selectedDate) => {
    if (selectedDate !== todayStr) return TIME_SLOTS;
    const nowHHmm = minDateTime.slice(11, 16); // HH:mm actuel
    return TIME_SLOTS.filter((slot) => slot > nowHHmm);
  };

  // MAJOR CITIES IN TUNISIA (simplified)
  const LOCATIONS = [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Gabès', 'Bizerte', 'Ariana', 'Gafsa',
    'Nabeul', 'Monastir', 'Mahdia', 'Ben Arous', 'Jendouba', 'El Kef', 'Tozeur',
    'Kasserine', 'Sidi Bouzid', 'Béja', 'Siliana', 'Zaghouan', 'Manouba', 'Kébili',
    'Médenine', 'Tataouine', 'Hammamet'
  ];

  const airportTranslations = {
    fr: [
      'Aéroport Tunis Carthage',
      'Aéroport Monastir Habib Bourguiba',
      'Aéroport Enfidha Hammamet',
      'Aéroport Djerba–Zarzis'
    ],
    en: [
      'Tunis Carthage Airport',
      'Monastir Habib Bourguiba Airport',
      'Enfidha Hammamet Airport',
      'Djerba–Zarzis Airport'
    ]
  };

  const allLocations = [...airportTranslations[language], ...LOCATIONS];

  const [activeField, setActiveField] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);
  // ✅ terme de recherche séparé de la valeur sélectionnée
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // ✅ quand la langue change, on recalcule les options et on reset la recherche
  useEffect(() => {
    setFilteredLocations(allLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ✅ le filtre dépend de searchTerm (et non plus de formData.from/to)
  useEffect(() => {
    if (!activeField) return;
    const term = searchTerm.toLowerCase().trim();
    setFilteredLocations(
      term === ''
        ? allLocations
        : allLocations.filter(l => l.toLowerCase().includes(term))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, activeField, language]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField(null);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ à l'ouverture d'un champ, on vide le searchTerm
  const handleFocus = (field) => {
    setActiveField(field);
    setSearchTerm('');
  };

  const handleSelectLocation = (location) => {
    setFormData(prev => ({ ...prev, [activeField]: location }));
    clearError(activeField); // ✅ efface l'erreur du champ choisi (et celle de "même lieu")
    if (activeField === 'from') clearError('to');
    setActiveField(null);
    setSearchTerm('');
  };

  // ✅ NOUVEAU : validation complète avant de passer à l'étape suivante
  const validate = () => {
    const e = {};

    if (!formData.from) e.from = t.errFrom;
    if (!formData.to) e.to = t.errTo;
    if (formData.from && formData.to && formData.from === formData.to) {
      e.to = t.errSameLocation;
    }

    if (!formData.departDate) e.departDate = t.errDepartDate;
    if (!formData.departTime) e.departTime = t.errDepartTime;

    if (tripType === 'round-trip') {
      if (!formData.returnDate) e.returnDate = t.errReturnDate;
      if (!formData.returnTime) e.returnTime = t.errReturnTime;

      if (
        formData.departDate && formData.departTime &&
        formData.returnDate && formData.returnTime
      ) {
        const dep = `${formData.departDate}T${formData.departTime}`;
        const ret = `${formData.returnDate}T${formData.returnTime}`;
        if (ret <= dep) e.returnDate = t.errReturnBefore;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ⛔ Bloque la navigation si un champ est vide / invalide
    if (!validate()) return;

    // ✅ Reconstruire les datetime-local (YYYY-MM-DDTHH:mm) pour l'URL
    const departDateTime = `${formData.departDate}T${formData.departTime}`;
    const returnDateTime = `${formData.returnDate}T${formData.returnTime}`;

    const params = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      departDate: departDateTime,
      tripType: tripType,
      passengers: formData.passengers.toString()
    });

    if (tripType === 'round-trip') {
      params.append('returnDate', returnDateTime);
    }

    navigate(`/transferts/vehicules?${params.toString()}`);
  };

  const inputBase =
    'w-full min-w-0 h-12 sm:h-auto bg-white/5 border px-3 py-3 text-base sm:text-sm outline-none text-cream [color-scheme:dark] sm:[color-scheme:normal]';
  const borderFor = (key) =>
    errors[key] ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-gold';

  return (
    <section className="relative sm:min-h-screen flex items-center pt-28 pb-12 sm:pt-28 sm:pb-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 sm:bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-dark-DEFAULT/70 sm:from-dark-DEFAULT via-dark-DEFAULT/40 to-dark-DEFAULT/80 sm:to-transparent z-10" />
        <img
          src="/images/bg.jpg"
          alt="Tunisia Luxury"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 items-center">
          <div className="lg:col-span-7 space-y-5 sm:space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-gold/30 bg-gold/5 backdrop-blur-sm">
              <span className="w-8 h-[1px] bg-gold"></span>
              <span className="text-gold text-[10px] uppercase tracking-[4px] font-bold">Service Premium 24/7</span>
            </div>
            {/* ✅ Titre réduit sur mobile (text-3xl) et progressif jusqu'à text-8xl sur desktop */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-cream leading-[1.05] sm:leading-[0.95]">
              {t.heroTitle} <br />
              <em className="text-gold italic">{t.heroTitleEm}</em> <br />
              {t.heroTitleEnd}
            </h1>
            {/* ✅ Paragraphe réduit sur mobile pour laisser de la place au formulaire */}
            <p className="text-cream/80 sm:text-cream/70 text-base md:text-lg lg:text-xl font-light max-w-xl leading-relaxed">
              {t.heroDescription}
            </p>
          </div>
          {/* ✅ FIX : id sans "#" pour que /#transferts fonctionne */}
          <div id="transferts" className="lg:col-span-5 animate-fade-up scroll-mt-28">
            <div className="bg-dark-2/40 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 shadow-2xl relative">
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t border-r border-gold/50"></div>
              <h2 className="font-serif text-xl sm:text-2xl text-cream mb-5 sm:mb-6 uppercase tracking-wider">{t.bookingTitle}</h2>

              <div className="flex gap-4 mb-8">
                {['one-way', 'round-trip'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTripType(type);
                      clearError('returnDate', 'returnTime');
                    }}
                    className={`text-[11px] sm:text-[10px] uppercase tracking-[2px] pb-2 transition-all relative ${
                      tripType === type ? 'text-gold' : 'text-cream/40 hover:text-cream'
                    }`}
                  >
                    {type === 'one-way' ? t.oneWay : t.roundTrip}
                    {tripType === type && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-slide-in"></div>}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <LocationInput 
                  label={t.departure} 
                  icon={<MapPin size={16}/>} 
                  value={formData.from} 
                  onFocus={() => handleFocus('from')}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  suggestions={filteredLocations} 
                  onSelect={handleSelectLocation} 
                  isActive={activeField === 'from'} 
                  dropdownRef={dropdownRef}
                  placeholder={t.enterLocation}
                  noResultText={t.noResult}
                  error={errors.from}
                />
                <LocationInput 
                  label={t.destination} 
                  icon={<MapPin size={16} className="text-gold"/>} 
                  value={formData.to} 
                  onFocus={() => handleFocus('to')}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  suggestions={filteredLocations} 
                  onSelect={handleSelectLocation} 
                  isActive={activeField === 'to'} 
                  dropdownRef={dropdownRef}
                  placeholder={t.enterLocation}
                  noResultText={t.noResult}
                  error={errors.to}
                />
                
                <div className={`grid grid-cols-1 gap-4`}>
                  {/* --- DATE + HEURE DE DÉPART --- */}
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-[10px] uppercase tracking-widest text-gold/60 ml-1">{t.departDate}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date" 
                        min={todayStr}
                        value={formData.departDate}
                        className={`${inputBase} ${borderFor('departDate')}`}
                        onChange={(e) => {
                          setFormData({...formData, departDate: e.target.value, departTime: ''});
                          clearError('departDate', 'departTime', 'returnDate');
                        }}
                      />
                      <select
                        value={formData.departTime}
                        className={`${inputBase} ${borderFor('departTime')}`}
                        onChange={(e) => {
                          setFormData({...formData, departTime: e.target.value});
                          clearError('departTime', 'returnDate');
                        }}
                      >
                        <option value="" className="bg-dark-2">--:--</option>
                        {getAvailableSlots(formData.departDate).map((slot) => (
                          <option key={slot} value={slot} className="bg-dark-2">{slot}</option>
                        ))}
                      </select>
                    </div>
                    <FieldError message={errors.departDate || errors.departTime} />
                  </div>

                  {/* --- DATE + HEURE DE RETOUR --- */}
                  {tripType === 'round-trip' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[11px] sm:text-[10px] uppercase tracking-widest text-gold/60 ml-1">{t.returnDate}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="date" 
                          min={formData.departDate || todayStr}
                          value={formData.returnDate}
                          className={`${inputBase} ${borderFor('returnDate')}`}
                          onChange={(e) => {
                            setFormData({...formData, returnDate: e.target.value, returnTime: ''});
                            clearError('returnDate', 'returnTime');
                          }}
                        />
                        <select
                          value={formData.returnTime}
                          className={`${inputBase} ${borderFor('returnTime')}`}
                          onChange={(e) => {
                            setFormData({...formData, returnTime: e.target.value});
                            clearError('returnTime', 'returnDate');
                          }}
                        >
                          <option value="" className="bg-dark-2">--:--</option>
                          {getAvailableSlots(formData.returnDate).map((slot) => (
                            <option key={slot} value={slot} className="bg-dark-2">{slot}</option>
                          ))}
                        </select>
                      </div>
                      <FieldError message={errors.returnDate || errors.returnTime} />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-4 mt-4 uppercase text-xs tracking-[3px] transition-all flex items-center justify-center gap-2">
                  {t.checkPrices} <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- AUTRES COMPOSANTS DE STRUCTURE ---

// ✅ NOUVEAU : petit message d'erreur sous un champ
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1.5 animate-fade-in">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
      {message}
    </p>
  );
}

function ServiceCard({ icon, title, description, image, learnMore }) {
  return (
    <div className="group relative overflow-hidden bg-dark-DEFAULT border border-white/5">
      <div className="h-48 sm:h-64 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-dark-DEFAULT/40 group-hover:bg-dark-DEFAULT/20 transition-all"></div>
        <div className="absolute top-6 left-6 w-16 h-16 bg-gold flex items-center justify-center text-dark shadow-xl">
          {icon}
        </div>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <h3 className="font-serif text-2xl group-hover:text-gold transition-colors">{title}</h3>
        <p className="text-cream/50 text-sm leading-relaxed">{description}</p>
        <button className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold pt-4 hover:gap-4 transition-all">
          {learnMore} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function WhyFeature({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
      <div className="text-gold group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[11px] uppercase tracking-wider sm:tracking-widest leading-snug sm:leading-normal text-center font-medium">{text}</span>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="group">
      <div className="w-12 h-[1px] bg-gold mx-auto mb-6 group-hover:w-24 transition-all duration-500"></div>
      <h3 className="font-serif text-xl mb-3">{title}</h3>
      <p className="text-cream/50 text-sm leading-relaxed px-4">{description}</p>
    </div>
  );
}

// LocationInput : searchTerm + onSearchChange + affichage d'erreur
function LocationInput({ 
  label, icon, value, onFocus, isActive, suggestions, onSelect, 
  dropdownRef, placeholder, searchTerm, onSearchChange, noResultText, error
}) {
  return (
    <div className="relative space-y-1">
      <label className="text-[11px] sm:text-[10px] uppercase tracking-widest text-gold/60 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50">{icon}</span>
        <input 
          // Quand le champ est actif, on affiche searchTerm (éditable).
          // Sinon on affiche la valeur sélectionnée.
          value={isActive ? searchTerm : (value || '')}
          onFocus={onFocus}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border px-10 py-3.5 sm:py-3 text-base sm:text-sm outline-none text-cream ${
            error ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-gold'
          }`}
        />
      </div>
      <FieldError message={error} />
      {isActive && (
        <div ref={dropdownRef} className="absolute z-[100] left-0 right-0 mt-2 bg-dark-2 border border-white/10 shadow-2xl max-h-48 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-cream/40 italic">{noResultText}</div>
          ) : (
            suggestions.map((loc) => (
              <div 
                key={loc} 
                onClick={() => onSelect(loc)} 
                className="px-4 py-3.5 text-sm sm:py-3 sm:text-xs text-cream/80 hover:bg-gold hover:text-dark cursor-pointer flex items-center gap-3"
              >
                {loc.toLowerCase().includes('airport') || loc.toLowerCase().includes('aéroport') ? 
                  <Plane size={14} className="text-gold"/> : 
                  <MapPin size={14}/>
                } 
                {loc}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}