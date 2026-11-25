import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { excursionAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext'; // Vérifiez le bon chemin

// --- DICTIONNAIRE DE TRADUCTION ---
const detailTranslations = {
  en: {
    // UI de base
    loading: "Loading...",
    errorMsg: "Excursion not found or connection error",
    reviews: "reviews",
    duration: "Duration",
    maxPersons: "Max persons",
    program: "Itinerary",
    included: "Included",
    notIncluded: "Not included",
    priceFor4: "price for 4 persons",
    groupPrices: "Group prices",
    upTo: "up to",
    pers: "pers.",
    bookBtn: "Book this excursion",
    confirmMsg: "Immediate confirmation · Free cancellation 48h before",
    maxGroup: "Max group",
    languageLabel: "Language",
    languages: "French, Arabic",
    
    // Traduction des 8 excursions (Noms)
    names: {
      "Excursion d'une demi-journée berbère à Zaghouan": "Half-day Berber excursion to Zaghouan",
      "Demi-Journée au Musée du Bardo": "Half-day at the Bardo Museum",
      "Excursion Sahel : Monastir, Sousse et Port El Kantaoui": "Sahel Excursion: Monastir, Sousse and Port El Kantaoui",
      "Excursion d'une demi-journée à Sidi Bou Saïd": "Half-day excursion to Sidi Bou Said",
      "Excursion Archéologique à Dougga et Bulla Regia": "Archaeological Excursion to Dougga and Bulla Regia",
      "Excursion d'une journée à Tunis Carthage | Sidi Bou Saïd": "Full-day excursion to Tunis Carthage | Sidi Bou Said",
      "Excursion à la journée à Kairouan et El Jem": "Full-day excursion to Kairouan and El Jem",
      "Demi-journée au Parc Friguia": "Half-day at Friguia Park"
    },

    // Traduction des descriptions
    descriptions: {
      "Excursion d'une demi-journée berbère à Zaghouan": "This half-day excursion takes you to the picturesque town of Zaghouan, known for its natural springs that have supplied Tunis with water since Roman times. Visit the Temple of Water, an ancient Berber and Roman site, and enjoy the lush greenery and serene landscapes of the Zaghouan mountains.",
      "Demi-Journée au Musée du Bardo": "Discover one of the most impressive museums in North Africa during this half-day guided tour. The Bardo Museum, housed in a former palace, contains the largest collection of Roman mosaics in the world, along with artifacts covering Tunisia's rich history, from prehistoric times to the Islamic period.",
      "Excursion Sahel : Monastir, Sousse et Port El Kantaoui": "Your excursion begins in Monastir, a coastal town full of charm and history. In addition to its beautiful beaches, discover the Ribat of Monastir, a historic fortress, as well as the Bourguiba Mosque, dedicated to President Habib Bourguiba, born in Monastir. Explore the lively medina and its typical souks before enjoying a superb view of the Mediterranean Sea. Then head to Sousse to stroll through its UNESCO-listed Medina, filled with vibrant markets and ancient streets. The journey ends at Port El Kantaoui, a picturesque marina perfect for a relaxing end.",
      "Excursion d'une demi-journée à Sidi Bou Saïd": "Spend a relaxing half-day in Sidi Bou Said, a picturesque village perched above the Mediterranean. Stroll through its cobbled streets lined with whitewashed houses and blue shutters, visit local cafes and enjoy breathtaking sea views that have inspired artists for centuries.",
      "Excursion Archéologique à Dougga et Bulla Regia": "Travel back in time with this fascinating tour of two of North Africa's most impressive archaeological sites. Explore the UNESCO World Heritage site of Dougga, often called North Africa's best-preserved Roman small town, and marvel at the unique underground villas of Bulla Regia with their well-preserved mosaics and ingenious ancient cooling system.",
      "Excursion d'une journée à Tunis Carthage | Sidi Bou Saïd": "Explore the rich history and breathtaking sites of Tunisia's most iconic places. Visit the historic Medina of Tunis with its winding alleys and lively souks, discover the impressive collection of Roman mosaics at the Bardo Museum, stroll through the ancient ruins of Carthage, and enjoy the picturesque blue and white village of Sidi Bou Said overlooking the Mediterranean.",
      "Excursion à la journée à Kairouan et El Jem": "Discover two historical gems of Tunisia: the holy city of Kairouan and the magnificent Roman amphitheater of El Jem.",
      "Demi-journée au Parc Friguia": "Spend a memorable half-day at Friguia Park, a 36-hectare zoological park located between Hammamet and Sousse in Enfidha. Opened on November 11, 2000, it houses nearly 400 animals and includes Tunisia's only dolphinarium. In addition to the zoo, enjoy folkloric troupe performances, sea lion shows, and a variety of animal exhibits, making it an ideal family outing."
    },

    // Traduction des éléments de listes (Inclus / Non inclus / Itinéraires)
    items: {
      "L'assurance": "Insurance",
      "Le carburant": "Fuel",
      "Le transport": "Transport",
      "Transport privé": "Private transport",
      "Voiture climatisée": "Air-conditioned car",
      "Les péages d'autoroutes": "Highway tolls",
      "Les repas": "Meals",
      "Les dépenses d'ordre personnel": "Personal expenses",
      "Les droits d'entrées aux musées ou expositions": "Entrance fees to museums or exhibitions",
      // Itinéraires
      "Départ": "Departure",
      "Départ depuis votre hôtel": "Departure from your hotel",
      "Médina de Tunis": "Medina of Tunis",
      "Visite la médina": "Visit the medina",
      "Carthage": "Carthage",
      "Découverte des ruines antiques": "Discovery of ancient ruins",
      "Sidi Bou Saïd": "Sidi Bou Said",
      "Balade dans le village bleu et blanc": "Walk in the blue and white village",
      "Visite Kairouan": "Kairouan Visit",
      "Grande Mosquée Okba Ibn Nafi": "Great Mosque of Okba Ibn Nafi",
      "Visite El Jem": "El Jem Visit",
      "amphithéâtre romain d'El Jem": "Roman amphitheater of El Jem",
      "Retour Vers l'hôtel": "Return to hotel"
    }
  },
  fr: {
    loading: "Chargement...",
    errorMsg: "Excursion non trouvée ou erreur de connexion",
    reviews: "avis",
    duration: "Durée",
    maxPersons: "Personnes max",
    program: "Programme",
    included: "Inclus",
    notIncluded: "Non inclus",
    priceFor4: "prix pour 4 personnes",
    groupPrices: "Tarifs par groupe",
    upTo: "jusqu'à",
    pers: "pers.",
    bookBtn: "Réserver cette excursion",
    confirmMsg: "Confirmation immédiate · Annulation gratuite 48h avant",
    maxGroup: "Groupe max",
    languageLabel: "Langue",
    languages: "Français, Arabe"
  }
};

export function ExcursionDetail() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const { language } = useLanguage(); 
  
  const [excursion, setExcursion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const t = detailTranslations[language] || detailTranslations.fr;

  useEffect(() => {
    const fetchExcursion = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await excursionAPI.getOne(id);
        if (response.data && response.data.success && response.data.excursion) {
          setExcursion(response.data.excursion);
        } else {
          setError('Format de réponse invalide');
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'excursion :", err);
        setError(t.errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchExcursion();
  }, [id, language]); // Ajout de language pour rafraichir si besoin

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center">
        <div className="text-gold font-serif text-2xl">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold font-serif text-4xl mb-4">😕</div>
          <div className="text-cream text-xl font-light">{error}</div>
        </div>
      </div>
    );
  }

  if (!excursion) return null;

  const handleBook = () => {
    navigate(`/excursions/book/${excursion._id}`);
  };

  // ── Normalisation de groupPrices (Map Mongoose OU objet JS) ──
  const rawGroupPrices = excursion.groupPrices || {};
  const groupPrices =
    rawGroupPrices instanceof Map
      ? Object.fromEntries(rawGroupPrices)
      : rawGroupPrices;

  // Prix minimum (toutes tailles de groupe confondues + prix/pers.)
  const groupValues = Object.values(groupPrices).filter((p) => p > 0);
  const minPrice = Math.min(
    ...groupValues,
    excursion.pricePerPerson || 0
  );

  // Petite image d'aperçu (utilisée dans la sidebar)
  const heroImage = getImageUrl(
    excursion.images?.[activeImg] || excursion.coverImage
  );

  // --- FONCTIONS DE TRADUCTION DYNAMIQUE ---
  const translateName = (name) => {
    if (language === 'en' && t.names && t.names[name]) return t.names[name];
    return name;
  };

  const translateDesc = (descName) => {
    if (language === 'en' && t.descriptions && t.descriptions[descName]) return t.descriptions[descName];
    return excursion.description;
  };

  const translateItem = (item) => {
    if (language === 'en' && t.items && t.items[item]) return t.items[item];
    return item;
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT pt-20">
      {/* Hero image */}
      <div className="relative h-[55vh] overflow-hidden">
        <img
          src={heroImage}
          alt={excursion.name}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-DEFAULT via-transparent to-transparent" />

        {excursion.images?.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {excursion.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeImg ? 'bg-gold w-6' : 'bg-cream/40'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gold text-xs tracking-[3px] uppercase">
              {excursion.destination}
            </span>
            {excursion.rating > 0 && (
              <span className="text-gold text-sm">
                ★ {excursion.rating}{' '}
                <span className="text-muted text-xs">
                  ({excursion.numReviews} {t.reviews})
                </span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-5xl font-light text-cream mb-6 leading-tight">
            {translateName(excursion.name)}
          </h1>

          <div className="flex gap-6 mb-8 text-sm">
            <div className="text-center">
              <div className="text-gold font-serif text-2xl">
                {excursion.duration}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                {t.duration}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold font-serif text-2xl">
                {excursion.maxCapacity}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                {t.maxPersons}
              </div>
            </div>
          </div>

          <p className="text-cream/70 font-light leading-relaxed mb-10">
            {translateDesc(excursion.name)}
          </p>

          {/* Itinerary */}
          {excursion.itinerary?.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-light text-cream mb-6">
                {t.program}
              </h2>
              <div className="space-y-4">
                {excursion.itinerary.map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="text-gold text-xs font-mono w-12 pt-1 shrink-0">
                      {step.time}
                    </div>
                    <div className="border-l border-gold/20 pl-5">
                      <div className="text-cream text-sm font-medium mb-1">
                        {translateItem(step.title)}
                      </div>
                      <div className="text-muted text-sm font-light">
                        {translateItem(step.description)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Includes/Excludes */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-gold text-xs tracking-[3px] uppercase mb-4">
                {t.included}
              </h3>
              <ul className="space-y-2">
                {excursion.includes?.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-cream/70 font-light"
                  >
                    <span className="text-green-400">✓</span>
                    {translateItem(item)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-gold text-xs tracking-[3px] uppercase mb-4">
                {t.notIncluded}
              </h3>
              <ul className="space-y-2">
                {excursion.excludes?.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-muted font-light"
                  >
                    <span className="text-red-400">✗</span>
                    {translateItem(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <div>
          <div className="bg-dark-3 border border-gold/15 p-8 sticky top-28">
            <div className="font-serif text-4xl font-light text-gold mb-1">
              {groupValues.length > 0
                ? `${groupValues[0]} €`
                : `${excursion.pricePerPerson || 0} €`}
            </div>
            <div className="text-muted text-xs mb-6">{t.priceFor4}</div>

            {/* Tarifs par groupe */}
            {Object.keys(groupPrices).length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-[3px] text-gold/60 mb-2">
                  {t.groupPrices}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(groupPrices).map(([size, price]) => (
                    <div
                      key={size}
                      className="text-center border border-gold/20 p-2 rounded"
                    >
                      <div className="text-gold text-sm font-serif">
                        {price} €
                      </div>
                      <div className="text-muted text-[9px]">
                        {t.upTo} {size} {t.pers}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-4 uppercase text-xs tracking-[3px] transition-all flex items-center justify-center gap-2 mb-4"
            >
              {t.bookBtn}
            </button>
            <p className="text-muted text-xs text-center font-light">
              {t.confirmMsg}
            </p>

            <div className="border-t border-gold/10 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">{t.duration}</span>
                <span className="text-cream">{excursion.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">{t.maxGroup}</span>
                <span className="text-cream">
                  {excursion.maxCapacity} {t.pers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">{t.languageLabel}</span>
                <span className="text-cream">{t.languages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExcursionDetail;