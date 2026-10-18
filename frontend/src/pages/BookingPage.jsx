// BookingPage.jsx
import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';

export function BookingPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { passengers: 1, vehicleType: searchParams.get('vehicle') || 'sedan', paymentMethod: 'cash' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        bookingType: type,
        ...(type === 'transfer' ? { transferId: id } : { excursionId: id }),
        departureDate: data.departureDate,
        passengers: Number(data.passengers),
        vehicleType: data.vehicleType,
        tripType: data.tripType || 'one-way',
        flightNumber: data.flightNumber,
        specialRequests: data.specialRequests,
        paymentMethod: data.paymentMethod,
      };
      const { data: res } = await bookingAPI.create(payload);
      toast.success('Réservation créée !');
      navigate(`/booking/confirm/${res.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="section-eyebrow">Réservation</div>
          <h1 className="font-serif text-4xl font-light text-cream mt-1">
            {type === 'transfer' ? 'Réserver un Transfert' : 'Réserver une Excursion'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0.5">
          <div className="field-group">
            <label className="field-label">Date de départ *</label>
            <input {...register('departureDate', { required: true })} type="date" className="input-dark" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="field-group">
            <label className="field-label">Nombre de passagers *</label>
            <input {...register('passengers', { required: true, min: 1 })} type="number" min="1" max="20" className="input-dark" />
          </div>
          {type === 'transfer' && (
            <>
              <div className="field-group">
                <label className="field-label">Type de trajet</label>
                <select {...register('tripType')} className="input-dark bg-dark-3">
                  <option value="one-way">Aller simple</option>
                  <option value="round-trip">Aller-retour</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Type de véhicule</label>
                <select {...register('vehicleType')} className="input-dark bg-dark-3">
                  <option value="sedan">Berline (4 pers)</option>
                  <option value="minivan">Minivan (7 pers)</option>
                  <option value="vip">VIP</option>
                  <option value="bus">Bus (15+ pers)</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Numéro de vol</label>
                <input {...register('flightNumber')} type="text" className="input-dark" placeholder="TU 1234" />
              </div>
            </>
          )}
          <div className="field-group">
            <label className="field-label">Mode de paiement</label>
            <select {...register('paymentMethod')} className="input-dark bg-dark-3">
              <option value="cash">Espèces (à l'arrivée)</option>
              <option value="card">Carte bancaire (en ligne)</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Demandes spéciales</label>
            <textarea {...register('specialRequests')} className="input-dark resize-none" rows="3" placeholder="Siège bébé, assistance PMR, etc." />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-60">
            {loading ? 'Réservation en cours...' : 'Confirmer la réservation →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// BookingConfirm.jsx
export function BookingConfirm() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        <div className="text-gold text-6xl mb-6">✦</div>
        <h1 className="font-serif text-4xl font-light text-cream mb-4">Réservation confirmée !</h1>
        <p className="text-muted font-light mb-2">Un email de confirmation vous a été envoyé.</p>
        <p className="text-gold text-sm mb-8">Référence : {id?.slice(-8).toUpperCase()}</p>
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="btn-gold">Mon tableau de bord</a>
          <a href="/" className="btn-outline">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );
}

// NotFound.jsx
export function NotFound() {
  return (
    <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center px-6 pt-20 text-center">
      <div>
        <div className="font-serif text-[120px] font-light text-gold/20 leading-none">404</div>
        <h1 className="font-serif text-4xl font-light text-cream mb-4">Page introuvable</h1>
        <p className="text-muted font-light mb-8">La page que vous recherchez n'existe pas.</p>
        <a href="/" className="btn-gold">Retour à l'accueil</a>
      </div>
    </div>
  );
}

export default BookingPage;
