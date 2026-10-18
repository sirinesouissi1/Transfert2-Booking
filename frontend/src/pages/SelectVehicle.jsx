// pages/formulaire/SelectVehicle.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Check, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function SelectVehicle() {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupération des paramètres de l'URL (envoyés depuis Home.jsx)
  const params = new URLSearchParams(location.search);
  const tripData = {
    from: params.get('from') || 'Tunis Carthage Airport',
    to: params.get('to') || 'Sousse',
    date: params.get('departDate') || '2024-05-20T10:00',
    passengers: params.get('passengers') || '1',
    tripType: params.get('tripType') || 'one-way',
    returnDate: params.get('returnDate') || ''
  };

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const url = new URL('http://localhost:5002/api/prices/trip');
        url.searchParams.append('from', tripData.from);
        url.searchParams.append('to', tripData.to);
        // Normaliser tripType : 'one-way' → 'one_way', 'round-trip' → 'round_trip'
        const normalizedTripType = tripData.tripType === 'round-trip' ? 'round_trip' : 'one_way';
        url.searchParams.append('tripType', normalizedTripType);

        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erreur serveur');
        }
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } catch (error) {
        console.error('Erreur chargement véhicules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [tripData.from, tripData.to, tripData.tripType]);

  const handleNext = () => {
    if (!selectedId) return;
    const vehicle = vehicles.find(v => v._id === selectedId);
    const normalizedTripType = tripData.tripType === 'round-trip' ? 'round_trip' : 'one_way';

    const queryParams = new URLSearchParams({
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      price: vehicle.price ?? '', // si null, chaîne vide
      image: vehicle.image,
      from: tripData.from,
      to: tripData.to,
      departureDate: tripData.date,
      returnDate: tripData.returnDate,
      tripType: normalizedTripType,
      passengers: tripData.passengers
    }).toString();

    navigate(`/transferts/details?${queryParams}`);
  };

  // Affichage du loader
  if (loading) {
    return (
      <div className="bg-dark-DEFAULT min-h-screen flex items-center justify-center">
        <div className="text-gold text-sm uppercase tracking-widest">Chargement des véhicules...</div>
      </div>
    );
  }

  // Formatage de la date pour affichage
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non spécifiée';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-dark-DEFAULT min-h-screen font-sans text-cream selection:bg-gold selection:text-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Stepper */}
        <div className="flex flex-col items-center mb-12 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center tracking-tight">
            Sélectionnez votre <em className="text-gold italic underline decoration-gold/30 underline-offset-8">véhicule</em>
          </h1>
          <div className="flex items-center justify-center w-full max-w-2xl px-4">
            <Step number="1" label="Trajet" active={true} completed={true} />
            <div className="flex-1 h-[1px] bg-gold/30 mx-4 md:mx-8"></div>
            <Step number="2" label="Véhicule" active={true} />
            <div className="flex-1 h-[1px] bg-white/10 mx-4 md:mx-8"></div>
            <Step number="3" label="Confirmation" active={false} />
          </div>
        </div>

        {/* Résumé du trajet */}
        <div className="max-w-4xl mx-auto mb-16 animate-fade-in delay-100 bg-dark-2/40 backdrop-blur-sm border border-white/5 p-6 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">Départ</p>
                <p className="font-medium">{tripData.from}</p>
                <p className="text-sm text-cream/60">{formatDate(tripData.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">Destination</p>
                <p className="font-medium">{tripData.to}</p>
                {tripData.tripType === 'round-trip' && tripData.returnDate && (
                  <p className="text-sm text-cream/60">Retour : {formatDate(tripData.returnDate)}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">Passagers</p>
                <p className="font-medium">{tripData.passengers} personne(s)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream/40">Type de trajet</p>
                <p className="font-medium">{tripData.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des véhicules */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((car) => (
              <div
                key={car._id}
                onClick={() => setSelectedId(car._id)}   // ← TOUJOURS sélectionnable
                className={`group relative bg-dark-2/40 backdrop-blur-md border transition-all duration-500 p-8 flex flex-col cursor-pointer ${
                  selectedId === car._id
                    ? 'border-gold shadow-[0_0_40px_rgba(197,160,89,0.1)] translate-y-[-8px]'
                    : 'border-white/5 hover:border-gold/30 hover:translate-y-[-4px]'
                }`}
              >
                {/* Badge sélection */}
                <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  selectedId === car._id ? 'bg-gold border-gold' : 'border-white/20'
                }`}>
                  {selectedId === car._id && <Check size={14} className="text-dark font-bold" />}
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-2xl mb-1">{car.name}</h3>
                  <p className="text-[10px] uppercase tracking-[2px] text-gold/60">{car.description || car.desc}</p>
                </div>

                <div className="relative h-44 mb-8 transition-transform duration-700 group-hover:scale-110">
                  <img src={car.image} alt={car.name} className="w-full h-full object-contain filter drop-shadow-2xl" />
                </div>

                <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between text-xs text-cream/40 border-b border-white/5 pb-4">
                    <span className="flex items-center gap-2"><Users size={14} className="text-gold"/> {car.capacity} places</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-gold"/> Attente Incluse</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-cream/40 mb-1">Tarif tout inclus</p>
                      {car.price
                        ? <p className="text-3xl font-serif text-gold">{car.price} €</p>
                        : <p className="text-sm text-muted italic">Prix sur demande</p>
                      }
                    </div>
                    <span className={`text-[10px] border px-2 py-1 rounded uppercase tracking-wider ${
                      tripData.tripType === 'round-trip'
                        ? 'text-purple-400 border-purple-400/30 bg-purple-400/5'
                        : 'text-blue-400 border-blue-400/30 bg-blue-400/5'
                    }`}>
                      {tripData.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton suivant */}
          <div className="flex justify-center md:justify-end mt-16 animate-fade-in">
            <button 
              onClick={handleNext}
              disabled={!selectedId}
              className={`group relative flex items-center justify-center gap-4 px-16 py-6 uppercase text-xs tracking-[4px] font-bold transition-all overflow-hidden w-full md:w-auto ${
                selectedId 
                ? 'bg-gold text-dark' 
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              }`}
            >
              <span className="relative z-10 flex items-center gap-3">
                Continuer <ArrowRight size={18} />
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

// Sous-composant Step
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