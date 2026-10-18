// Transfers.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { transferAPI } from '../services/api';
import useAuthStore from '../context/authStore';

export function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    transferAPI.getAll({ from: searchParams.get('from'), to: searchParams.get('to') })
      .then(({ data }) => setTransfers(data.transfers || []))
      .catch(() => setTransfers([
        { _id: '1', name: 'Tunis-Carthage → Hammamet', from: 'Aéroport Tunis-Carthage', to: 'Hammamet', duration: 60, basePrice: 80, isAirport: true, vehicleTypes: [{ type: 'sedan', capacity: 4, price: 80 }, { type: 'minivan', capacity: 7, price: 120 }] },
        { _id: '2', name: 'Monastir → Sousse', from: 'Aéroport de Monastir', to: 'Sousse', duration: 30, basePrice: 50, isAirport: true, vehicleTypes: [{ type: 'sedan', capacity: 4, price: 50 }] },
        { _id: '3', name: 'Enfidha → Yasmine Hammamet', from: 'Aéroport Enfidha-Hammamet', to: 'Yasmine Hammamet', duration: 20, basePrice: 40, isAirport: true, vehicleTypes: [{ type: 'sedan', capacity: 4, price: 40 }, { type: 'vip', capacity: 4, price: 90 }] },
        { _id: '4', name: 'Djerba Airport → Midoun', from: 'Aéroport Djerba-Zarzis', to: 'Midoun', duration: 25, basePrice: 35, isAirport: true, vehicleTypes: [{ type: 'sedan', capacity: 4, price: 35 }] },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const VEHICLE_LABELS = { sedan: 'Berline', minivan: 'Minivan', vip: 'VIP', bus: 'Bus' };

  return (
    <div className="min-h-screen bg-dark-DEFAULT pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <div className="section-eyebrow">Nos transferts</div>
          <h1 className="font-serif text-5xl font-light text-cream mt-1">
            Transferts <em className="text-gold-light">Aéroportuaires</em>
          </h1>
          <p className="text-muted text-base font-light mt-3 max-w-xl">Prise en charge professionnelle depuis et vers les 4 principaux aéroports de Tunisie.</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-dark-3 h-36 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {transfers.map((t) => (
              <div key={t._id} className="card-dark p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {t.isAirport && <span className="text-[9px] tracking-[2px] uppercase border border-gold/30 text-gold px-2 py-0.5">Aéroport</span>}
                    </div>
                    <h3 className="font-serif text-xl font-light text-cream mb-1">{t.from}</h3>
                    <div className="flex items-center gap-3 text-muted text-sm"><span>→</span><span className="text-cream">{t.to}</span><span>· {t.duration} min</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div>
                      <span className="font-serif text-3xl font-light text-gold">à partir de {t.basePrice}</span>
                      <span className="text-muted text-xs ml-1">TND</span>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {t.vehicleTypes?.map((v) => (
                        <button key={v.type} onClick={() => token ? navigate(`/booking/transfer/${t._id}?vehicle=${v.type}`) : navigate('/login')}
                          className="text-[9px] tracking-[2px] uppercase border border-gold/25 text-gold px-3 py-1.5 hover:bg-gold hover:text-dark-DEFAULT transition-all">
                          {VEHICLE_LABELS[v.type]} ({v.capacity}p) — {v.price} TND
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transfers;
