// pages/formulaire/SelectVehicle.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Check, Clock, Luggage, Snowflake, Plane } from 'lucide-react';
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
    totalPrice: "Tarif tout inclus", priceOnRequest: "Prix sur demande",
    continueBtn: "Continuer", errorLoading: "Erreur lors du chargement des véhicules.",
    routeInfo: "Itinéraire du transfert",
    openMaps: "Ouvrir dans Google Maps",
    tripDetails: "Détails du Trajet"
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
    totalPrice: "All-inclusive price", priceOnRequest: "Price on request",
    continueBtn: "Continue", errorLoading: "Error loading vehicles.",
    routeInfo: "Transfer route",
    openMaps: "Open in Google Maps",
    tripDetails: "Trip Details"
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
  const [selectedId, setSelectedId] = useState(null);

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

  const handleNext = () => {
    if (!selectedId) return;
    const vehicle = vehicles.find((v) => v._id === selectedId);
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
        <div className="text-gold text-sm uppercase tracking-widest">{t.loading}</div>
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
        <div className="flex flex-col items-center mb-10 animate-fade-in">
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

        {/* ✅ NOUVELLE DISPOSITION : 2 Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Colonne GAUCHE : Liste des véhicules (8/12) */}
          <div className="lg:col-span-8 animate-fade-up">
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
                {error}
              </div>
            )}

            {vehicles.length === 0 && !error ? (
              <p className="text-center text-muted italic py-12">{t.priceOnRequest}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((car) => (
                  <div
                    key={car._id}
                    onClick={() => setSelectedId(car._id)}
                    className={`group relative bg-dark-2/40 backdrop-blur-md border transition-all duration-500 p-6 flex flex-col cursor-pointer ${
                      selectedId === car._id
                        ? 'border-gold shadow-[0_0_40px_rgba(197,160,89,0.1)] translate-y-[-8px]'
                        : 'border-white/10 hover:border-gold/30 hover:translate-y-[-4px]'
                    }`}
                  >
                    <div className={`absolute top-5 right-5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      selectedId === car._id ? 'bg-gold border-gold' : 'border-white/20'
                    }`}>
                      {selectedId === car._id && <Check size={14} className="text-dark font-bold" />}
                    </div>

                    <div className="mb-4">
                      <h3 className="font-serif text-2xl mb-1 truncate pr-8">{car.name}</h3>
                    </div>

                    <div className="relative h-36 mb-6 transition-transform duration-700 group-hover:scale-110">
                      <img src={car.image} alt={car.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                    </div>

                    <div className="mt-auto space-y-5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cream/60 border-b border-white/5 pb-4">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-gold" /> {car.capacity} {t.seats}
                        </span>
                        {Number(car.luggage) > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Luggage size={14} className="text-gold" /> x{car.luggage} {t.luggage}
                          </span>
                        )}
                        {car.hasAC && (
                          <span className="flex items-center gap-1.5">
                            <Snowflake size={14} className="text-gold" /> {t.ac}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-cream/40 mb-1">{t.totalPrice}</p>
                          {car.price != null && Number(car.price) > 0 ? (
                            <p className="text-3xl font-serif text-gold">{car.price} €</p>
                          ) : (
                            <p className="text-sm text-muted italic">{t.priceOnRequest}</p>
                          )}
                        </div>
                        <span className={`text-[10px] border px-2 py-1 rounded uppercase tracking-wider ${
                          tripData.tripType === 'round-trip'
                            ? 'text-purple-400 border-purple-400/30 bg-purple-400/5'
                            : 'text-blue-400 border-blue-400/30 bg-blue-400/5'
                        }`}>
                          {tripData.tripType === 'round-trip' ? t.roundTrip : t.oneWay}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bouton Continuer */}
            <div className="flex justify-center md:justify-start mt-10 animate-fade-in">
              <button
                onClick={handleNext}
                disabled={!selectedId}
                className={`group relative flex items-center justify-center gap-4 px-16 py-5 uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden w-full md:w-auto ${
                  selectedId ? 'bg-gold text-dark' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                }`}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continueBtn} <ArrowRight size={18} />
                </span>
                {selectedId && (
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                )}
              </button>
            </div>
          </div>

          {/* Colonne DROITE : Carte unifiée (4/12) - Collante au scroll */}
          <div className="lg:col-span-4 animate-fade-in delay-200 sticky top-32">
            <div className="bg-dark-2/40 backdrop-blur-xl border border-white/10 p-6 rounded-xs">
              
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
              <div className="border border-white/10 rounded-sm overflow-hidden bg-[#1F1F2E]">
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