// pages/formulaire/SelectVehicle.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Check, Clock, Luggage, Snowflake } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';
import { priceAPI } from '../services/api'; // ✅ AJOUT

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
    continueBtn: "Continuer", errorLoading: "Erreur lors du chargement des véhicules."
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
    continueBtn: "Continue", errorLoading: "Error loading vehicles."
  }
};

// ✅ Normalisation UNIQUE et réutilisable
const normalizeTripType = (t) => {
  if (t === 'round_trip' || t === 'round-trip') return 'round_trip';
  return 'one_way';
};

// ✅ L'ordre exact d'affichage souhaité (du 1er au dernier)
const VEHICLE_ORDER = [
  'vw virtus',
  'skoda octavia',
  'suzuki ertiga',
  'vw transporter',
  'mercedes classe e',
];

// ✅ Fonction pour trier les véhicules selon l'ordre défini
const sortVehicles = (list = []) => {
  const rank = (name = '') => {
    // Supprime les accents (ex: "Škoda" devient "skoda") et met en minuscule
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const idx = VEHICLE_ORDER.findIndex((key) => normalized.includes(key));
    return idx === -1 ? 999 : idx; // Si le véhicule n'est pas dans la liste, il va à la fin
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

        // ✅ Utilisation de priceAPI (base URL + auth via l'intercepteur axios)
        const res = await priceAPI.forTrip({
          from: tripData.from,
          to: tripData.to,
          tripType: normalizedTripType,
        });

        if (!cancelled) {
          // ✅ APPLICATION DU TRI ICI
          setVehicles(sortVehicles(res.data.vehicles || []));
        }
      } catch (err) {
        console.error('Erreur chargement véhicules:', err);
        if (!cancelled) {
          setError(err.response?.data?.message || t.errorLoading);
        }
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
      // ✅ INDISPENSABLE : capacité du véhicule pour brider les compteurs côté formulaire
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

        {/* Résumé trajet */}
        <div className="max-w-4xl mx-auto mb-16 animate-fade-in delay-100 bg-dark-2/40 backdrop-blur-sm border border-white/5 p-6 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">{t.departure}</p>
                <p className="font-medium">{tripData.from}</p>
                <p className="text-sm text-cream/60">{formatDate(tripData.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">{t.destination}</p>
                <p className="font-medium">{tripData.to}</p>
                {tripData.tripType === 'round-trip' && tripData.returnDate && (
                  <p className="text-sm text-cream/60">{t.returnLabel} : {formatDate(tripData.returnDate)}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">{t.passengers}</p>
                <p className="font-medium">{tripData.passengers} {t.passengerWord}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">{t.tripType}</p>
                <p className="font-medium">{tripData.tripType === 'round-trip' ? t.roundTrip : t.oneWay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Erreur éventuelle */}
        {error && (
          <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {/* Grille véhicules */}
        <div className="max-w-6xl mx-auto">
          {vehicles.length === 0 && !error ? (
            <p className="text-center text-muted italic py-12">{t.priceOnRequest}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((car) => (
                <div
                  key={car._id}
                  onClick={() => setSelectedId(car._id)}
                  className={`group relative bg-dark-2/40 backdrop-blur-md border transition-all duration-500 p-8 flex flex-col cursor-pointer ${
                    selectedId === car._id
                      ? 'border-gold shadow-[0_0_40px_rgba(197,160,89,0.1)] translate-y-[-8px]'
                      : 'border-white/5 hover:border-gold/30 hover:translate-y-[-4px]'
                  }`}
                >
                  <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    selectedId === car._id ? 'bg-gold border-gold' : 'border-white/20'
                  }`}>
                    {selectedId === car._id && <Check size={14} className="text-dark font-bold" />}
                  </div>

                  <div className="mb-6">
                    <h3 className="font-serif text-2xl mb-1">{car.name}</h3>
                    {/* ✅ DESCRIPTION SUPPRIMÉE ICI */}
                  </div>

                  <div className="relative h-44 mb-8 transition-transform duration-700 group-hover:scale-110">
                    <img src={car.image} alt={car.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/60 border-b border-white/5 pb-4">
                      <span className="flex items-center gap-2">
                        <Users size={14} className="text-gold" /> {car.capacity} {t.seats}
                      </span>
                      {Number(car.luggage) > 0 && (
                        <span className="flex items-center gap-2">
                          <Luggage size={14} className="text-gold" /> x{car.luggage} {t.luggage}
                        </span>
                      )}
                      {car.hasAC && (
                        <span className="flex items-center gap-2">
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

          <div className="flex justify-center md:justify-end mt-16 animate-fade-in">
            <button
              onClick={handleNext}
              disabled={!selectedId}
              className={`group relative flex items-center justify-center gap-4 px-16 py-6 uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden w-full md:w-auto ${
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