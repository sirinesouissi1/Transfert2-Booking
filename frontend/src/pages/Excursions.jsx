import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { excursionAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext'; 

// Dictionnaire de traduction pour les excursions
const excursionTranslations = {
  en: {
    // Noms des excursions
    "Excursion d'une demi-journée berbère à Zaghouan": "Half-day Berber excursion to Zaghouan",
    "Demi-Journée au Musée du Bardo": "Half-day at the Bardo Museum",
    "Excursion Sahel : Monastir, Sousse et Port El Kantaoui": "Sahel Excursion: Monastir, Sousse and Port El Kantaoui",
    "Excursion d'une demi-journée à Sidi Bou Saïd": "Half-day excursion to Sidi Bou Said",
    "Excursion Archéologique à Dougga et Bulla Regia": "Archaeological Excursion to Dougga and Bulla Regia",
    "Excursion d'une journée à Tunis Carthage | Sidi Bou Saïd": "Full-day excursion to Tunis Carthage | Sidi Bou Said",
    "Excursion à la journée à Kairouan et El Jem": "Full-day excursion to Kairouan and El Jem",
    "Demi-journée au Parc Friguia": "Half-day at Friguia Park",
    
    // Destinations
    "Zaghouene": "Zaghouan",
    "Musée du Bardo": "Bardo Museum",
    "Monastir, Sousse et Port El Kantaoui": "Monastir, Sousse and Port El Kantaoui",
    "Sidi Bou Saïd": "Sidi Bou Said",
    "Dougga et Bulla Regia": "Dougga and Bulla Regia",
    "Tunis-Carthage-Sidi Bou Saïd": "Tunis-Carthage-Sidi Bou Said",
    "Kairouan et El Jem": "Kairouan and El Jem",
    "Parc Friguia": "Friguia Park",

    // Textes de l'interface
    title: "Our",
    titleHighlight: "Excursions",
    subtitle: "Carefully selected itineraries for unique and memorable experiences.",
    searchPlaceholder: "Search for an excursion...",
    priceByGroup: "Price varies by group",
    viewBtn: "VIEW",
    noResults: "No excursions match your criteria.",
    reviews: "reviews",
    errorMsg: "Unable to load excursions. Please try again later."
  },
  fr: {
    title: "Nos",
    titleHighlight: "Excursions",
    subtitle: "Des itinéraires soigneusement sélectionnés pour des expériences uniques et mémorables.",
    searchPlaceholder: "Rechercher une excursion...",
    priceByGroup: "Tarif selon le groupe",
    viewBtn: "VOIR",
    noResults: "Aucune excursion ne correspond à vos critères.",
    reviews: "avis",
    errorMsg: "Impossible de charger les excursions. Veuillez réessayer plus tard."
  }
};

export default function Excursions() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = excursionTranslations[language] || excursionTranslations.fr;

  const [excursions, setExcursions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('Toutes');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExcursions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 8 };
      if (category !== 'Toutes') params.category = category;
      if (search) params.search = search;

      const response = await excursionAPI.getAll(params);
      if (response.data && response.data.success) {
        setExcursions(response.data.excursions || []);
        setTotalPages(response.data.pages || 1);
      } else {
        setError('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des excursions :', err);
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcursions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExcursions();
  };

  const getIndicativePrice = (exc) => {
    if (exc.groupPrices) {
      const gp =
        exc.groupPrices instanceof Map
          ? Object.fromEntries(exc.groupPrices)
          : exc.groupPrices;
      if (gp && gp['4']) return gp['4'];
    }
    return exc.pricePerPerson || 0;
  };

  // Fonction pour traduire le nom et la destination de l'excursion
  const translateExcursion = (text) => {
    if (language === 'en' && excursionTranslations.en[text]) {
      return excursionTranslations.en[text];
    }
    return text;
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT pt-24">
      {/* Header */}
      <div className="relative py-20 px-6 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1539622106114-e0df812097e6?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="section-eyebrow justify-center">
            {language === 'fr' ? 'Découvrez la Tunisie' : 'Discover Tunisia'}
          </div>
          <h1 className="font-serif text-6xl font-light text-cream mt-2 mb-4">
            {t.title} <em className="text-gold-light">{t.titleHighlight}</em>
          </h1>
          <p className="text-muted text-base font-light max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-10">
          <div className="flex flex-wrap gap-0"></div>

          <form
            onSubmit={handleSearch}
            className="flex border border-gold/20 focus-within:border-gold transition-colors"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-muted outline-none w-64 font-light"
            />
            <button type="submit" className="px-4 py-2.5 text-muted hover:text-gold transition-colors">
              <FiSearch className="w-4 h-4" />
            </button>
          </form>
        </div>

        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-gold text-xl font-light mb-2">😕</div>
            <p className="text-cream/70">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-dark-3 animate-pulse h-80 rounded" />
            ))}
          </div>
        ) : excursions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cream/70">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {excursions.map((exc) => (
              <div key={exc._id} className="card-dark overflow-hidden group">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getImageUrl(exc.coverImage)}
                    alt={exc.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {exc.badge && (
                    <span className="absolute top-3 left-3 bg-gold text-dark-DEFAULT text-[9px] tracking-[2px] uppercase px-3 py-1 font-semibold">
                      {exc.badge === 'POPULAIRE' && language === 'en' ? 'POPULAR' : exc.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl font-light text-cream mb-2 leading-snug">
                    {translateExcursion(exc.name)}
                  </h3>
                  <div className="flex gap-3 text-muted text-xs mb-1">
                    <span>⏱ {exc.duration}</span>
                    <span>
                      📍 {translateExcursion(exc.destination)}
                    </span>
                  </div>
                  {exc.rating > 0 && (
                    <div className="text-gold text-xs mb-3">
                      {'★'.repeat(Math.round(exc.rating))}{' '}
                      <span className="text-muted ml-1">
                        ({exc.numReviews} {t.reviews})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                    <div>
                      <span className="text-muted text-xs italic font-light">
                        {t.priceByGroup}
                      </span>
                    </div>
                    <Link
                      to={`/excursions/${exc._id}`}
                      className="border border-gold/30 text-gold text-[9px] tracking-[2px] uppercase px-4 py-2 hover:bg-gold hover:text-dark-DEFAULT transition-all"
                    >
                      {t.viewBtn}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 text-sm border transition-all ${
                  page === i + 1
                    ? 'bg-gold text-dark-DEFAULT border-gold'
                    : 'border-gold/20 text-muted hover:border-gold hover:text-gold'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ AJOUT DU BOUTON WHATSAPP FLOTTANT */}
      <WhatsAppButton />
      
    </div>
  );
}

// --- BOUTON WHATSAPP FLOTTANT ---
function WhatsAppButton() {
  // Numéro de téléphone au format international SANS le "+" ni les espaces
  const phoneNumber = "21653078293"; 
  // Message pré-rempli quand l'utilisateur clique
  const message = encodeURIComponent("Bonjour GoTaxi, je souhaite avoir plus d'informations.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] group flex items-center justify-center"
      aria-label="Contactez-nous sur WhatsApp"
    >
      {/* Bulle d'information au survol (Desktop) */}
      <div className="absolute right-full mr-4 bg-dark-2 border border-white/10 text-cream text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block">
        Besoin d'aide ? Écrivez-nous !
      </div>
      
      {/* Bouton vert avec effet de pulsation */}
      <div className="relative bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center">
        {/* Effet de pulsation derrière le bouton */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></span>
        
        {/* Logo WhatsApp SVG */}
        <svg 
          viewBox="0 0 448 512" 
          width="28" 
          height="28" 
          fill="currentColor"
          className="relative z-10"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </div>
    </a>
  );
}