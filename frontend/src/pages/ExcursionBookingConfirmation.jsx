import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { excursionBookingAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext'; // Assurez-vous du bon chemin

// --- DICTIONNAIRE DE TRADUCTION ---
const confirmationTranslations = {
  en: {
    loading: "Loading...",
    title: "Excursion Confirmed",
    subtitle: "Thank you for your trust",
    codeLabel: "Your confirmation code:",
    codePending: "PENDING",
    emailSent: "A confirmation email has been sent to you.",
    teamContact: "Our team will contact you to finalize the organization.",
    backBtn: "Back to excursions"
  },
  fr: {
    loading: "Chargement...",
    title: "Excursion Confirmée",
    subtitle: "Merci pour votre confiance",
    codeLabel: "Votre code de confirmation :",
    codePending: "EN COURS",
    emailSent: "Un email de confirmation vous a été envoyé.",
    teamContact: "Notre équipe vous contactera pour finaliser l'organisation.",
    backBtn: "Retour aux excursions"
  }
};

export default function ExcursionBookingConfirmation() {
  const { id } = useParams();
  const { language } = useLanguage(); // Récupération de la langue
  const t = confirmationTranslations[language] || confirmationTranslations.fr;

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
        <div className="text-gold text-sm uppercase tracking-widest">{t.loading}</div>
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

          <h1 className="font-serif text-4xl mb-4 text-white">{t.title}</h1>
          <p className="text-gold/60 uppercase tracking-[3px] text-xs mb-8">{t.subtitle}</p>
          
          <div className="bg-white/5 border border-white/10 p-6 mb-10">
            <p className="text-sm text-cream/60 mb-2">{t.codeLabel}</p>
            <p className="text-3xl font-serif text-gold tracking-widest">
              {booking?.confirmationCode || t.codePending}
            </p>
          </div>

          <div className="space-y-4 text-left border-t border-white/5 pt-8 mb-10">
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              {t.emailSent}
            </p>
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              {t.teamContact}
            </p>
          </div>

          <Link 
            to="/excursions" 
            className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-dark uppercase text-[10px] font-bold tracking-[3px] hover:bg-white transition-colors"
          >
            <Home size={16} /> {t.backBtn}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}