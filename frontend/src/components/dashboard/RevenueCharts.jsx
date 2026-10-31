import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiAward, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import {
  REVENUE_STATUSES,
  getBookingDate,
  getTotal,
  revenueByMonth,
  revenueByVehicle,
  topDestinations,
} from '../../utils/bookingTools';

const eur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
const TOOLTIP = { backgroundColor: '#2A2A3C', borderColor: '#C9A84C', color: '#fff' };

function Card({ title, icon, children }) {
  return (
    <div className="bg-[#2A2A3C] border border-white/10 p-6 rounded-lg">
      <h3 className="text-lg font-serif mb-4 text-cream flex items-center gap-2">
        <span className="text-gold">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

const Empty = () => <p className="text-muted text-sm">Aucune donnée disponible</p>;

export default function RevenueCharts({ bookings, vehicles }) {
  const { monthly, destinations, byVehicle, kpi } = useMemo(() => {
    const paid = bookings.filter((b) => REVENUE_STATUSES.includes(b.status));
    const priced = paid.filter((b) => getTotal(b) > 0);
    const total = priced.reduce((s, b) => s + getTotal(b), 0);

    const now = new Date();
    const thisMonth = priced
      .filter((b) => {
        const d = new Date(getBookingDate(b) || b.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, b) => s + getTotal(b), 0);

    return {
      monthly: revenueByMonth(bookings),
      destinations: topDestinations(bookings),
      byVehicle: revenueByVehicle(bookings, vehicles),
      kpi: {
        total,
        thisMonth,
        average: priced.length ? total / priced.length : 0,
        unpriced: paid.length - priced.length,
      },
    };
  }, [bookings, vehicles]);

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="text-xl font-serif text-cream">Revenus</h2>
        <p className="text-xs text-muted mt-1">
          Calculés sur les réservations confirmées, en cours et terminées, à la date du service.
          {kpi.unpriced > 0 && ` ${kpi.unpriced} réservation(s) « sur demande » sans prix ne sont pas comptées.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Chiffre d’affaires total', value: eur(kpi.total), icon: <FiDollarSign /> },
          { label: 'Ce mois-ci', value: eur(kpi.thisMonth), icon: <FiTrendingUp /> },
          { label: 'Panier moyen', value: eur(kpi.average), icon: <FiAward /> },
        ].map((k) => (
          <div key={k.label} className="bg-[#2A2A3C] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted text-sm">{k.label}</span>
              <span className="text-gold text-xl">{k.icon}</span>
            </div>
            <div className="text-3xl font-light text-cream">{k.value}</div>
          </div>
        ))}
      </div>

      <Card title="Chiffre d’affaires par mois" icon={<FiDollarSign />}>
        {monthly.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#aaa" tick={{ fill: '#aaa' }} />
              <YAxis stroke="#aaa" tickFormatter={(v) => `${v} €`} />
              <Tooltip
                contentStyle={TOOLTIP}
                formatter={(v, n, p) => [`${eur(v)} (${p.payload.count} résa.)`, 'Chiffre d’affaires']}
              />
              <Bar dataKey="revenue" fill="#C9A84C" name="Chiffre d’affaires" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Destinations les plus demandées" icon={<FiTrendingUp />}>
          {destinations.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, destinations.length * 44)}>
              <BarChart data={destinations} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#aaa" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#aaa" width={120} tick={{ fill: '#aaa', fontSize: 12 }} />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(v, n, p) => [`${v} réservation(s) · ${eur(p.payload.revenue)}`, 'Demande']}
                />
                <Bar dataKey="count" fill="#C9A84C" name="Réservations" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Véhicules les plus rentables" icon={<FiAward />}>
          {byVehicle.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, byVehicle.length * 44)}>
              <BarChart data={byVehicle} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#aaa" tickFormatter={(v) => `${v} €`} />
                <YAxis type="category" dataKey="name" stroke="#aaa" width={120} tick={{ fill: '#aaa', fontSize: 12 }} />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(v, n, p) => [`${eur(v)} · ${p.payload.count} course(s)`, 'Revenu']}
                />
                <Bar dataKey="revenue" fill="#27AE60" name="Revenu" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
