import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Calendar, Users, ArrowRight, ChevronDown, Plane, 
  ShieldCheck, Clock, Star, Wifi, Car, CreditCard, Mail, Phone,
  Globe
} from 'lucide-react';

// Importation des composants globaux
import Navbar from '../components/layout/Navbar'; 
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';

// Translations
const translations = {
  fr: {
    // Hero
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
    
    // Features
    premiumVehicles: "Véhicules Premium",
    premiumDesc: "Une flotte moderne et luxueuse pour un confort absolu durant vos trajets.",
    certifiedDrivers: "Chauffeurs Certifiés",
    certifiedDesc: "Des professionnels ponctuels et bilingues à votre entière disposition.",
    fixedPrices: "Prix Fixes",
    fixedDesc: "Aucun frais caché. Le tarif est fixé lors de votre réservation.",
    
    // About
    whoWeAre: "Qui sommes-nous",
    aboutTitle: "Votre Partenaire de Transport",
    aboutTitleGold: "de Confiance",
    aboutP1: "GoTaxi est une entreprise moderne, dirigée par des jeunes, fondée par un groupe d'amis unis par la passion d'offrir des services de navette privée exceptionnels à travers la Tunisie.",
    aboutP2: "Ensemble, ils cumulent plus d'une décennie d'expérience dans le transport et l'hospitalité. Cette équipe d'individus éduqués, dynamiques et éco-responsables s'engage à proposer des solutions de transport privé à la fois économiques et respectueuses de l'environnement.",
    aboutFooter: "Service 24h/24 et 7j/7 vers tous les aéroports.",
    yearsExperience: "Ans d'expérience",
    
    // Services
    ourServices: "Nos Services",
    airportTransfers: "Transferts Aéroport",
    airportDesc: "Services disponibles 24h/24 dans tous les principaux aéroports tunisiens : Tunis Carthage, Enfidha, Monastir et Sfax. Prix fixes garantis.",
    excursions: "Excursions Personnalisées",
    excursionsDesc: "Découvrez la Tunisie avec nos services sur mesure. Des sites historiques aux aventures désertiques, nous créons vos voyages mémorables.",
    learnMore: "En Savoir Plus",
    
    // Why Choose
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
    
    // Contact
    contactUs: "Contactez-Nous",
    contactDesc: "Une question ou une demande spécifique ? Notre équipe est à votre écoute 24h/24.",
    fullName: "Nom complet",
    email: "Email",
    subject: "Sujet",
    message: "Votre message",
    send: "Envoyer le message",
    callUs: "Appelez-nous",
    emailUs: "Email"
  },
  en: {
    // Hero
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
    
    // Features
    premiumVehicles: "Premium Vehicles",
    premiumDesc: "A modern and luxurious fleet for absolute comfort during your journeys.",
    certifiedDrivers: "Certified Drivers",
    certifiedDesc: "Punctual and bilingual professionals at your complete disposal.",
    fixedPrices: "Fixed Prices",
    fixedDesc: "No hidden fees. The price is set when you book.",
    
    // About
    whoWeAre: "Who We Are",
    aboutTitle: "Your Trusted",
    aboutTitleGold: "Transport Partner",
    aboutP1: "GoTaxi is a modern, youth-led company founded by a group of friends united by the passion to offer exceptional private shuttle services across Tunisia.",
    aboutP2: "Together, they have over a decade of experience in transportation and hospitality. This team of educated, dynamic, and eco-conscious individuals is committed to offering private transport solutions that are both economical and environmentally friendly.",
    aboutFooter: "24/7 service to all airports.",
    yearsExperience: "Years Experience",
    
    // Services
    ourServices: "Our Services",
    airportTransfers: "Airport Transfers",
    airportDesc: "24/7 services available at all major Tunisian airports: Tunis Carthage, Enfidha, Monastir, and Sfax. Fixed prices guaranteed.",
    excursions: "Custom Excursions",
    excursionsDesc: "Discover Tunisia with our tailor-made services. From historical sites to desert adventures, we create your memorable journeys.",
    learnMore: "Learn More",
    
    // Why Choose
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
    
    // Contact
    contactUs: "Contact Us",
    contactDesc: "A question or specific request? Our team is available 24/7.",
    fullName: "Full Name",
    email: "Email",
    subject: "Subject",
    message: "Your Message",
    send: "Send Message",
    callUs: "Call Us",
    emailUs: "Email"
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
        <section id="about" className="py-24 bg-dark-DEFAULT px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                <h2 className="font-serif text-4xl md:text-5xl leading-tight">
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
        <section id="services" className="py-24 bg-dark-2 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h3 className="text-gold uppercase tracking-[4px] text-xs font-bold mb-4">GoTaxi Service</h3>
            <h2 className="font-serif text-4xl md:text-5xl">{t.ourServices}</h2>
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
        <section className="py-24 bg-dark-DEFAULT px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl mb-4">{t.whyChoose} <span className="text-gold">{t.whyChooseGold}</span></h2>
              <div className="w-24 h-1 bg-gold mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
        <section id="contact" className="bg-dark-2 scroll-mt-20 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Map */}
            <div className="h-[400px] lg:h-auto min-h-[500px] grayscale contrast-125 opacity-50">
              <iframe 
                title="Tunisia Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3234.332306894056!2d10.634584!3d35.824503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130238a67d65755d%3A0xcd6467a3afcdc0d!2sSousse%2C%20Tunisia!5e0!3m2!1sen!2stn!4v1700000000000!5m2!1sen!2stn"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
              ></iframe>
            </div>

            {/* Formulaire */}
            <div className="p-12 lg:p-20 space-y-8 bg-dark-2">
              <h2 className="font-serif text-4xl">{t.contactUs}</h2>
              <p className="text-cream/60">{t.contactDesc}</p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder={t.fullName} className="w-full bg-white/5 border border-white/10 px-6 py-4 outline-none focus:border-gold transition-colors text-cream" />
                  <input type="email" placeholder={t.email} className="w-full bg-white/5 border border-white/10 px-6 py-4 outline-none focus:border-gold transition-colors text-cream" />
                </div>
                <input type="text" placeholder={t.subject} className="w-full bg-white/5 border border-white/10 px-6 py-4 outline-none focus:border-gold transition-colors text-cream" />
                <textarea rows="4" placeholder={t.message} className="w-full bg-white/5 border border-white/10 px-6 py-4 outline-none focus:border-gold transition-colors text-cream resize-none"></textarea>
                <button className="bg-gold text-dark font-bold uppercase tracking-widest px-10 py-4 hover:bg-gold-light transition-all w-full">
                  {t.send}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 flex items-center justify-center rounded-full text-gold"><Phone size={20}/></div>
                  <div><p className="text-[10px] uppercase text-gold">{t.callUs}</p><p className="text-sm">+216 71 000 000</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 flex items-center justify-center rounded-full text-gold"><Mail size={20}/></div>
                  <div><p className="text-[10px] uppercase text-gold">{t.emailUs}</p><p className="text-sm">contact@ GoTaxi.tn</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

// --- SOUS-COMPOSANT HERO (AVEC LOGIQUE D'ICONES DANS LE DROPDOWN) ---

function Hero({ t, language }) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');
  const [formData, setFormData] = useState({ 
    from: '', 
    to: '', 
    departDate: '', 
    returnDate: '', 
    passengers: 1
  });

  // MAJOR CITIES IN TUNISIA (simplified)
  const LOCATIONS = [
    'Tunis',
    'Sfax',
    'Sousse',
    'Kairouan',
    'Gabès',
    'Bizerte',
    'Ariana',
    'Gafsa',
    'Nabeul',
    'Monastir',
    'Mahdia',
    'Ben Arous',
    'Jendouba',
    'El Kef',
    'Tozeur',
    'Kasserine',
    'Sidi Bouzid',
    'Béja',
    'Siliana',
    'Zaghouan',
    'Manouba',
    'Kébili',
    'Médenine',
    'Tataouine',
    'Hammamet'
  ];

  // Airport translations
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredLocations(allLocations);
  }, [language]);

  useEffect(() => {
    if (activeField) {
      const searchTerm = formData[activeField].toLowerCase();
      setFilteredLocations(allLocations.filter(l => l.toLowerCase().includes(searchTerm)));
    }
  }, [formData.from, formData.to, activeField, language]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (location) => {
    setFormData(prev => ({ ...prev, [activeField]: location }));
    setActiveField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      departDate: formData.departDate,
      tripType: tripType,
      passengers: formData.passengers.toString()
    });

    if (tripType === 'round-trip' && formData.returnDate) {
      params.append('returnDate', formData.returnDate);
    }

    navigate(`/transferts/vehicules?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-DEFAULT via-dark-DEFAULT/40 to-transparent z-10" />
        <img
          src="/images/bg.jpg"
          alt="Tunisia Luxury"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-gold/30 bg-gold/5 backdrop-blur-sm">
              <span className="w-8 h-[1px] bg-gold"></span>
              <span className="text-gold text-[10px] uppercase tracking-[4px] font-bold">Service Premium 24/7</span>
            </div>
            <h1 className="font-serif text-6xl md:text-8xl text-cream leading-[0.9]">
              {t.heroTitle} <br />
              <em className="text-gold italic">{t.heroTitleEm}</em> <br />
              {t.heroTitleEnd}
            </h1>
            <p className="text-cream/70 text-lg md:text-xl font-light max-w-xl leading-relaxed">
              {t.heroDescription}
            </p>
          </div>
          <div id="#transferts" className="lg:col-span-5 animate-fade-up">
            <div className="bg-dark-2/40 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl relative">
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t border-r border-gold/50"></div>
              <h2 className="font-serif text-2xl text-cream mb-6 uppercase tracking-wider">{t.bookingTitle}</h2>

              {/* Sélecteur Type de trajet */}
              <div className="flex gap-4 mb-8">
                {['one-way', 'round-trip'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTripType(type)}
                    className={`text-[10px] uppercase tracking-[2px] pb-2 transition-all relative ${
                      tripType === type ? 'text-gold' : 'text-cream/40 hover:text-cream'
                    }`}
                  >
                    {type === 'one-way' ? t.oneWay : t.roundTrip}
                    {tripType === type && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-slide-in"></div>}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LocationInput 
                  label={t.departure} 
                  icon={<MapPin size={16}/>} 
                  value={formData.from} 
                  onFocus={() => setActiveField('from')} 
                  suggestions={filteredLocations} 
                  onSelect={handleSelectLocation} 
                  isActive={activeField === 'from'} 
                  dropdownRef={dropdownRef}
                  placeholder={t.enterLocation}
                />
                <LocationInput 
                  label={t.destination} 
                  icon={<MapPin size={16} className="text-gold"/>} 
                  value={formData.to} 
                  onFocus={() => setActiveField('to')} 
                  suggestions={filteredLocations} 
                  onSelect={handleSelectLocation} 
                  isActive={activeField === 'to'} 
                  dropdownRef={dropdownRef}
                  placeholder={t.enterLocation}
                />
                
                {/* Grille dynamique pour les dates */}
                <div className={`grid ${tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {/* Date de Départ */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">{t.departDate}</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-gold outline-none text-cream"
                      onChange={(e) => setFormData({...formData, departDate: e.target.value})}
                    />
                  </div>

                  {/* Date de Retour - Affichée uniquement si round-trip */}
                  {tripType === 'round-trip' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">{t.returnDate}</label>
                      <input 
                        type="datetime-local" 
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-gold outline-none text-cream"
                        onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      />
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

function ServiceCard({ icon, title, description, image, learnMore }) {
  return (
    <div className="group relative overflow-hidden bg-dark-DEFAULT border border-white/5">
      <div className="h-64 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-dark-DEFAULT/40 group-hover:bg-dark-DEFAULT/20 transition-all"></div>
        <div className="absolute top-6 left-6 w-16 h-16 bg-gold flex items-center justify-center text-dark shadow-xl">
          {icon}
        </div>
      </div>
      <div className="p-8 space-y-4">
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
    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
      <div className="text-gold group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[11px] uppercase tracking-widest text-center font-medium">{text}</span>
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

function LocationInput({ label, icon, value, onFocus, isActive, suggestions, onSelect, dropdownRef, placeholder }) {
  return (
    <div className="relative space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50">{icon}</span>
        <input 
          readOnly 
          value={value} 
          onFocus={onFocus} 
          placeholder={placeholder} 
          className="w-full bg-white/5 border border-white/10 px-10 py-3 text-sm focus:border-gold outline-none cursor-pointer" 
        />
      </div>
      {isActive && (
        <div ref={dropdownRef} className="absolute z-[100] left-0 right-0 mt-2 bg-dark-2 border border-white/10 shadow-2xl max-h-48 overflow-y-auto">
          {suggestions.map((loc) => (
            <div 
              key={loc} 
              onClick={() => onSelect(loc)} 
              className="px-4 py-3 text-xs text-cream/80 hover:bg-gold hover:text-dark cursor-pointer flex items-center gap-3"
            >
              {loc.toLowerCase().includes('airport') || loc.toLowerCase().includes('aéroport') ? 
                <Plane size={14} className="text-gold"/> : 
                <MapPin size={14}/>
              } 
              {loc}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}