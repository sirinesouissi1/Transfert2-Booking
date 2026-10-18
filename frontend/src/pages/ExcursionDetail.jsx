import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { excursionAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import { getImageUrl } from '../utils/imageUrl';

export function ExcursionDetail() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [excursion, setExcursion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

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
        setError('Excursion non trouvée ou erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    fetchExcursion();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center">
        <div className="text-gold font-serif text-2xl">Chargement...</div>
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
                  ({excursion.numReviews} avis)
                </span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-5xl font-light text-cream mb-6 leading-tight">
            {excursion.name}
          </h1>

          <div className="flex gap-6 mb-8 text-sm">
            <div className="text-center">
              <div className="text-gold font-serif text-2xl">
                {excursion.duration}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                Durée
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold font-serif text-2xl">
                {excursion.maxCapacity}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                Personnes max
              </div>
            </div>
            <div className="text-center">
              <div className="text-gold font-serif text-xl">
                {groupValues.length > 0
                  ? `${Math.min(...groupValues)} €`
                  : `${excursion.pricePerPerson || 0} €`}
              </div>
              <div className="text-muted text-xs uppercase tracking-wider">
                Prix/groupe (dès {minPrice} €)
              </div>
            </div>
          </div>

          <p className="text-cream/70 font-light leading-relaxed mb-10">
            {excursion.description}
          </p>

          {/* Itinerary */}
          {excursion.itinerary?.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-light text-cream mb-6">
                Programme
              </h2>
              <div className="space-y-4">
                {excursion.itinerary.map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="text-gold text-xs font-mono w-12 pt-1 shrink-0">
                      {step.time}
                    </div>
                    <div className="border-l border-gold/20 pl-5">
                      <div className="text-cream text-sm font-medium mb-1">
                        {step.title}
                      </div>
                      <div className="text-muted text-sm font-light">
                        {step.description}
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
                Inclus
              </h3>
              <ul className="space-y-2">
                {excursion.includes?.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-cream/70 font-light"
                  >
                    <span className="text-green-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-gold text-xs tracking-[3px] uppercase mb-4">
                Non inclus
              </h3>
              <ul className="space-y-2">
                {excursion.excludes?.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-muted font-light"
                  >
                    <span className="text-red-400">✗</span>
                    {item}
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
            <div className="text-muted text-xs mb-6">prix pour 4 personnes</div>

            {/* Tarifs par groupe */}
            {Object.keys(groupPrices).length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-[3px] text-gold/60 mb-2">
                  Tarifs par groupe
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
                        jusqu'à {size} pers.
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
              Réserver cette excursion
            </button>
            <p className="text-muted text-xs text-center font-light">
              Confirmation immédiate · Annulation gratuite 48h avant
            </p>

            <div className="border-t border-gold/10 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">Durée</span>
                <span className="text-cream">{excursion.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">Groupe max</span>
                <span className="text-cream">
                  {excursion.maxCapacity} pers.
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-light">Langue</span>
                <span className="text-cream">Français, Arabe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExcursionDetail;