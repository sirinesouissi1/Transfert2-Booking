import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { excursionBookingAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function ExcursionBookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await excursionBookingAPI.getOne(id);
        if (response.data?.success) {
          setBooking(response.data.booking);
        }
      } catch (error) {
        console.error('Erreur chargement confirmation', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-dark-DEFAULT min-h-screen flex items-center justify-center">
        <div className="text-gold text-sm uppercase tracking-widest">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-DEFAULT min-h-screen text-cream">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
        <div className="bg-dark-2/40 border border-white/10 p-12 rounded-xs backdrop-blur-xl animate-fade-up">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold animate-bounce">
              <CheckCircle size={48} />
            </div>
          </div>

          <h1 className="font-serif text-4xl mb-4 text-white">Excursion Confirmée</h1>
          <p className="text-gold/60 uppercase tracking-[3px] text-xs mb-8">Merci pour votre confiance</p>
          
          <div className="bg-white/5 border border-white/10 p-6 mb-10">
            <p className="text-sm text-cream/60 mb-2">Votre code de confirmation :</p>
            <p className="text-3xl font-serif text-gold tracking-widest">{booking?.confirmationCode || "EN COURS"}</p>
          </div>

          <div className="space-y-4 text-left border-t border-white/5 pt-8 mb-10">
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              Un email de confirmation vous a été envoyé.
            </p>
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              Notre équipe vous contactera pour finaliser l'organisation.
            </p>
          </div>

          <Link 
            to="/excursions" 
            className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-dark uppercase text-[10px] font-bold tracking-[3px] hover:bg-white transition-colors"
          >
            <Home size={16} /> Retour aux excursions
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}