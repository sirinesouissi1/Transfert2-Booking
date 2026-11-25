// pages/formulaire/SelectVehicle.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Check, Clock, Luggage, Snowflake, Plane, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';
import { priceAPI } from '../services/api';

const translations = {
  fr: {
    loading: "Chargement des véhicules...",
    title: "Sélectionnez votre",
    titleEm: "véhicule",
    step1: "Trajet", step2: "Véhicule", step3: "Confirmation",
    departure: "Départ", destination: "Destination", returnLabel: "Retour",
    passengers: "Passagers", passengerWord: "personne(s)",
    tripType: "Type de trajet", oneWay: "Aller simple", roundTrip: "Aller-retour",
    notSpecified: "Non spécifiée", seats: "places",
    luggage: "Bagages", ac: "Clim.",
    totalPrice: "Prix fixe tout compris", priceOnRequest: "Prix sur demande",
    continueBtn: "Réserver", errorLoading: "Erreur lors du chargement des véhicules.",
    routeInfo: "Itinéraire du transfert",
    openMaps: "Ouvrir dans Google Maps",
    tripDetails: "Détails du Trajet",
    vehiclesAvailable: "véhicules disponibles",
    duration: "Durée estimée",
    freeWait: "Temps d'attente offert",
    flightTrack: "Suivi de vol",
    tolls: "Péages inclus",
    cancellation: "Annulation gratuite"
  },
  en: {
    loading: "Loading vehicles...",
    title: "Select your", titleEm: "vehicle",
    step1: "Trip", step2: "Vehicle", step3: "Confirmation",
    departure: "Departure", destination: "Destination", returnLabel: "Return",
    passengers: "Passengers", passengerWord: "person(s)",
    tripType: "Trip Type", oneWay: "One way", roundTrip: "Round trip",
    notSpecified: "Not specified", seats: "seats",
    luggage: "Luggage", ac: "A/C",
    totalPrice: "Fixed all-inclusive price", priceOnRequest: "Price on request",
    continueBtn: "Book", errorLoading: "Error loading vehicles.",
    routeInfo: "Transfer route",
    openMaps: "Open in Google Maps",
    tripDetails: "Trip Details",
    vehiclesAvailable: "vehicles available",
    duration: "Estimated duration",
    freeWait: "Free waiting time",
    flightTrack: "Flight tracking",
    tolls: "Tolls included",
    cancellation: "Free cancellation"
  }
};

const normalizeTripType = (t) => {
  if (t === 'round_trip' || t === 'round-trip') return 'round_trip';
  return 'one_way';
};

const VEHICLE_ORDER = [
  'vw virtus', 'skoda octavia', 'suzuki ertiga', 'vw transporter', 'mercedes classe e',
];

const sortVehicles = (list = []) => {
  const rank = (name = '') => {
    const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const idx = VEHICLE_ORDER.findIndex((key) => normalized.includes(key));
    return idx === -1 ? 999 : idx;
  };
  return [...list].sort((a, b) => rank(a.name) - rank(b.name));
};

export default function SelectVehicle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const currentLocale = language === 'fr' ? 'fr-FR' : 'en-US';

  const params = new URLSearchParams(location.search);
  const tripData = {
    from: params.get('from') || 'Tunis Carthage Airport',
    to: params.get('to') || 'Sousse',
    date: params.get('departDate') || '2024-05-20T10:00',
    passengers: params.get('passengers') || '1',
    tripType: params.get('tripType') || 'one-way',
    returnDate: params.get('returnDate') || '',
  };

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const normalizedTripType = normalizeTripType(tripData.tripType);
        const res = await priceAPI.forTrip({
          from: tripData.from,
          to: tripData.to,
          tripType: normalizedTripType,
        });
        if (!cancelled) setVehicles(sortVehicles(res.data.vehicles || []));
      } catch (err) {
        console.error('Erreur chargement véhicules:', err);
        if (!cancelled) setError(err.response?.data?.message || t.errorLoading);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchVehicles();
    return () => { cancelled = true; };
  }, [tripData.from, tripData.to, tripData.tripType, t.errorLoading]);

  // ✅ Modification : On passe le véhicule en paramètre directement lors du clic sur "Réserver"
  const handleNext = (vehicle) => {
    if (!vehicle) return;
    const normalizedTripType = normalizeTripType(tripData.tripType);

    const queryParams = new URLSearchParams({
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      price: vehicle.price ?? '',
      image: vehicle.image || '',
      capacity: vehicle.capacity ?? '',
      from: tripData.from,
      to: tripData.to,
      departureDate: tripData.date,
      returnDate: tripData.returnDate,
      tripType: normalizedTripType,
      passengers: tripData.passengers,
    }).toString();

    navigate(`/transferts/details?${queryParams}`);
  };

  if (loading) {
    return (
      <div className="bg-dark-DEFAULT min-h-screen flex items-center justify-center">
        <div className="text-gold text-sm uppercase tracking-widest animate-pulse">{t.loading}</div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return t.notSpecified;
    const date = new Date(dateStr);
    return date.toLocaleDateString(currentLocale, {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="bg-dark-DEFAULT min-h-screen font-sans text-cream selection:bg-gold selection:text-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Stepper */}
        <div className="flex flex-col items-center mb-12 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center tracking-tight">
            {t.title} <em className="text-gold italic underline decoration-gold/30 underline-offset-8">{t.titleEm}</em>
          </h1>
          <div className="flex items-center justify-center w-full max-w-2xl px-4">
            <Step number="1" label={t.step1} active={true} completed={true} />
            <div className="flex-1 h-[1px] bg-gold/30 mx-4 md:mx-8"></div>
            <Step number="2" label={t.step2} active={true} />
            <div className="flex-1 h-[1px] bg-white/10 mx-4 md:mx-8"></div>
            <Step number="3" label={t.step3} active={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Colonne GAUCHE : Liste des véhicules (8/12) */}
          <div className="lg:col-span-8 animate-fade-up">
            
            {/* Header de la liste */}
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <p className="text-sm text-cream/70">
                <strong className="text-cream">{vehicles.length}</strong> {t.vehiclesAvailable}
              </p>
              <p className="text-[10px] text-gold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} /> {t.totalPrice}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
                {error}
              </div>
            )}

            {vehicles.length === 0 && !error ? (
              <p className="text-center text-muted italic py-12">{t.priceOnRequest}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {vehicles.map((car) => (
                  <div
                    key={car._id}
                    className="group bg-dark-2/40 backdrop-blur-md border border-white/10 hover:border-gold/30 transition-all duration-300 rounded-lg p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6"
                  >
                    {/* Image à gauche */}
                    <div className="w-full md:w-48 lg:w-64 h-32 flex-shrink-0 flex items-center justify-center bg-black/20 rounded-md p-2">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>

                    {/* Infos au milieu */}
                    <div className="flex-1 w-full text-center md:text-left">
                      <h3 className="font-serif text-2xl mb-2 text-cream">{car.name}</h3>
                      
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-xs text-cream/70 mb-4">
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" /> {car.capacity} {t.passengers}</span>
                        {Number(car.luggage) > 0 && (
                          <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-gold" /> {car.luggage} {t.luggage}</span>
                        )}
                        {car.hasAC && (
                          <span className="flex items-center gap-1.5"><Snowflake size={14} className="text-gold" /> {t.ac}</span>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-xs text-cream/80 mb-4">
                        <Clock size={13} className="text-gold" /> {t.duration} : 45 min (estimé)
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] text-cream/50">
                        <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> {t.freeWait}</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> {t.flightTrack}</span>
                        <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> {t.tolls}</span>
                      </div>
                    </div>

                    {/* Prix + Bouton à droite */}
                    <div className="w-full md:w-40 flex-shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted mb-1 hidden md:block">{t.totalPrice}</p>
                        {car.price != null && Number(car.price) > 0 ? (
                          <p className="text-3xl font-serif text-gold mb-2">{car.price} €</p>
                        ) : (
                          <p className="text-sm text-muted italic mb-2">{t.priceOnRequest}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleNext(car)}
                        className="bg-gold hover:bg-gold-light text-dark font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                      >
                        {t.continueBtn} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Colonne DROITE : Carte unifiée (4/12) */}
          <div className="lg:col-span-4 animate-fade-in delay-200 sticky top-32">
            <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-6 rounded-lg shadow-xl">
              
              <h3 className="font-serif text-xl mb-6 border-b border-white/5 pb-4 text-gold">
                {t.tripDetails}
              </h3>

              {/* Timeline Trajet */}
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <Plane size={14} />
                    </div>
                    <div className="w-[1px] h-full bg-gradient-to-b from-gold/30 to-transparent my-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-[9px] uppercase tracking-[4px] text-gold/40 mb-1">{t.departure}</p>
                    <p className="text-sm font-medium text-cream leading-tight">{tripData.from}</p>
                    <p className="text-xs text-cream/50 mt-1">{formatDate(tripData.date)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <MapPin size={14} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[4px] text-gold/40 mb-1">{t.destination}</p>
                    <p className="text-sm font-medium text-cream leading-tight">{tripData.to}</p>
                    {tripData.tripType === 'round-trip' && tripData.returnDate && (
                      <p className="text-xs text-cream/50 mt-1">{t.returnLabel} : {formatDate(tripData.returnDate)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Infos passagers et type */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm text-[11px] text-cream/80">
                  <Users size={12} className="text-gold" /> {tripData.passengers} {t.passengerWord}
                </span>
                <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm text-[11px] text-cream/80">
                  <Calendar size={12} className="text-gold" /> {tripData.tripType === 'round-trip' ? t.roundTrip : t.oneWay}
                </span>
              </div>

              {/* Carte Google Maps Intégrée */}
              <div className="border border-white/10 rounded-md overflow-hidden bg-[#1F1F2E]">
                <div className="relative h-[220px] w-full">
                  <iframe
                    title="Carte du trajet"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?saddr=${encodeURIComponent(tripData.from)}&daddr=${encodeURIComponent(tripData.to)}&output=embed`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 opacity-90 hover:opacity-100 transition-opacity duration-300"
                  ></iframe>
                </div>
                <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(tripData.from)}&destination=${encodeURIComponent(tripData.to)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-gold hover:text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                  >
                    <MapPin size={12} /> {t.openMaps}
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function Step({ number, label, active, completed }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-700 ${
        completed ? 'bg-gold text-dark' :
        active ? 'border-gold text-gold border-2 shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'border-white/10 text-white/20 border'
      }`}>
        {completed ? <Check size={18} /> : number}
      </div>
      <span className={`text-[10px] uppercase tracking-[3px] font-bold hidden sm:block ${active ? 'text-cream' : 'text-white/20'}`}>
        {label}
      </span>
    </div>
  );
}