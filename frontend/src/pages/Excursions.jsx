import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { excursionAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

export default function Excursions() {
  const [searchParams] = useSearchParams();
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
      setError('Impossible de charger les excursions. Veuillez réessayer plus tard.');
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

  // Prix indicatif (groupe de 4 pers. si dispo, sinon prix/pers.)
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
          <div className="section-eyebrow justify-center">Découvrez la Tunisie</div>
          <h1 className="font-serif text-6xl font-light text-cream mt-2 mb-4">
            Nos <em className="text-gold-light">Excursions</em>
          </h1>
          <p className="text-muted text-base font-light max-w-xl mx-auto">
            Des itinéraires soigneusement sélectionnés pour des expériences uniques et mémorables.
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
              placeholder="Rechercher une excursion..."
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
            <p className="text-cream/70">Aucune excursion ne correspond à vos critères.</p>
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
                      {exc.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl font-light text-cream mb-2 leading-snug">
                    {exc.name}
                  </h3>
                  <div className="flex gap-3 text-muted text-xs mb-1">
                    <span>⏱ {exc.duration}</span>
                    <span>📍 {exc.destination}</span>
                  </div>
                  {exc.rating > 0 && (
                    <div className="text-gold text-xs mb-3">
                      {'★'.repeat(Math.round(exc.rating))}{' '}
                      <span className="text-muted ml-1">({exc.numReviews} avis)</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                    <div>
                      <span className="font-serif text-2xl font-light text-gold">
                        {getIndicativePrice(exc)}
                      </span>
                      <span className="text-muted text-xs ml-1">€/groupe (4 pers.)</span>
                    </div>
                    <Link
                      to={`/excursions/${exc._id}`}
                      className="border border-gold/30 text-gold text-[9px] tracking-[2px] uppercase px-4 py-2 hover:bg-gold hover:text-dark-DEFAULT transition-all"
                    >
                      Voir
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
    </div>
  );
}