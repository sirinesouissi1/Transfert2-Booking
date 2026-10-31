import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiDownload, FiSearch, FiX } from 'react-icons/fi';

/**
 * Recherche + filtre statut + filtre période + pagination, pour n'importe quelle liste.
 * `searchText`, `getDate`, `getStatus` doivent être des fonctions stables (définies hors composant).
 */
export function useTableFilters(items, { searchText, getDate, getStatus, pageSize = 10 } = {}) {
  const [query, setQueryRaw] = useState('');
  const [status, setStatusRaw] = useState('all');
  const [from, setFromRaw] = useState('');
  const [to, setToRaw] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSizeRaw] = useState(pageSize);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromT = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toT = to ? new Date(`${to}T23:59:59.999`).getTime() : null;

    return items.filter((it) => {
      if (q && !String(searchText ? searchText(it) : '').toLowerCase().includes(q)) return false;
      if (status !== 'all' && getStatus && getStatus(it) !== status) return false;
      if ((fromT || toT) && getDate) {
        const t = new Date(getDate(it)).getTime();
        if (isNaN(t)) return false;
        if (fromT && t < fromT) return false;
        if (toT && t > toT) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, status, from, to]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * size, safePage * size);

  // Tout changement de filtre ramène à la page 1
  const wrap = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const hasFilters = Boolean(query || status !== 'all' || from || to);

  return {
    filtered,
    pageItems,
    total: items.length,
    query,
    setQuery: wrap(setQueryRaw),
    status,
    setStatus: wrap(setStatusRaw),
    from,
    setFrom: wrap(setFromRaw),
    to,
    setTo: wrap(setToRaw),
    page: safePage,
    setPage,
    pageCount,
    size,
    setSize: (v) => {
      setSizeRaw(Number(v));
      setPage(1);
    },
    hasFilters,
    reset: () => {
      setQueryRaw('');
      setStatusRaw('all');
      setFromRaw('');
      setToRaw('');
      setPage(1);
    },
  };
}

const INPUT =
  'bg-[#35354A] border border-white/10 rounded px-3 py-2 text-sm text-cream placeholder-muted/50 focus:outline-none focus:border-gold/40';

export function TableToolbar({
  f,
  placeholder = 'Rechercher…',
  statusLabels,
  showPeriod = false,
  periodLabel = 'Période',
  onExport,
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            type="search"
            value={f.query}
            onChange={(e) => f.setQuery(e.target.value)}
            placeholder={placeholder}
            className={`${INPUT} w-full pl-9`}
          />
        </div>

        {statusLabels && (
          <select value={f.status} onChange={(e) => f.setStatus(e.target.value)} className={INPUT}>
            <option value="all">Tous les statuts</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}

        {showPeriod && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="hidden sm:inline">{periodLabel} :</span>
            <input
              type="date"
              value={f.from}
              max={f.to || undefined}
              onChange={(e) => f.setFrom(e.target.value)}
              className={`${INPUT} [color-scheme:dark]`}
              aria-label={`${periodLabel} - du`}
            />
            <span>→</span>
            <input
              type="date"
              value={f.to}
              min={f.from || undefined}
              onChange={(e) => f.setTo(e.target.value)}
              className={`${INPUT} [color-scheme:dark]`}
              aria-label={`${periodLabel} - au`}
            />
          </div>
        )}

        {f.hasFilters && (
          <button
            onClick={f.reset}
            className="flex items-center gap-1 text-xs text-muted hover:text-gold transition-colors"
          >
            <FiX size={14} /> Réinitialiser
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            disabled={f.filtered.length === 0}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded text-sm border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Exporte les lignes filtrées (CSV compatible Excel)"
          >
            <FiDownload size={15} /> Exporter CSV
          </button>
        )}
      </div>
      <p className="text-xs text-muted">
        {f.filtered.length} résultat{f.filtered.length !== 1 ? 's' : ''}
        {f.hasFilters && ` sur ${f.total}`}
      </p>
    </div>
  );
}

export function NoResults({ f }) {
  if (f.filtered.length > 0) return null;
  return (
    <div className="p-10 text-center text-sm text-muted">
      {f.total === 0 ? 'Aucune donnée pour le moment.' : 'Aucun résultat pour ces critères.'}
      {f.hasFilters && (
        <div>
          <button onClick={f.reset} className="mt-3 text-gold hover:underline text-xs">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}

export function Pagination({ f }) {
  if (f.filtered.length === 0) return null;

  const first = (f.page - 1) * f.size + 1;
  const last = Math.min(f.page * f.size, f.filtered.length);

  let start = Math.max(1, f.page - 2);
  const end = Math.min(f.pageCount, start + 4);
  start = Math.max(1, end - 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const btn =
    'min-w-[32px] h-8 px-2 rounded text-xs border transition-colors flex items-center justify-center';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 text-xs text-muted">
      <div className="flex items-center gap-3">
        <span>
          {first}–{last} sur {f.filtered.length}
        </span>
        <select
          value={f.size}
          onChange={(e) => f.setSize(e.target.value)}
          className="bg-[#35354A] border border-white/10 rounded px-2 py-1 text-cream focus:outline-none"
          aria-label="Lignes par page"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => f.setPage(f.page - 1)}
          disabled={f.page <= 1}
          className={`${btn} border-white/10 hover:border-gold/40 disabled:opacity-30`}
          aria-label="Page précédente"
        >
          <FiChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => f.setPage(p)}
            className={`${btn} ${
              p === f.page ? 'bg-gold/15 border-gold/40 text-gold' : 'border-white/10 hover:border-gold/40'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => f.setPage(f.page + 1)}
          disabled={f.page >= f.pageCount}
          className={`${btn} border-white/10 hover:border-gold/40 disabled:opacity-30`}
          aria-label="Page suivante"
        >
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
