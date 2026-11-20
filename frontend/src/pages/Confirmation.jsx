// confirmation transfert

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext'; // <-- AJOUT

// --- AJOUT DES TRADUCTIONS ---
const translations = {
  fr: {
    title: "Réservation Confirmée",
    subtitle: "Merci pour votre confiance",
    yourCode: "Votre code de confirmation :",
    codePending: "EN COURS",
    emailSent: "Un email de confirmation vous a été envoyé.",
    driverContact: "Le chauffeur vous contactera sur WhatsApp.",
    backHome: "Retour à l'accueil",
  },
  en: {
    title: "Booking Confirmed",
    subtitle: "Thank you for your trust",
    yourCode: "Your confirmation code:",
    codePending: "IN PROGRESS",
    emailSent: "A confirmation email has been sent to you.",
    driverContact: "The driver will contact you on WhatsApp.",
    backHome: "Back to home",
  }
};

export default function Confirmation() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code');

  // --- RECUPERATION DE LA LANGUE ---
  const { language } = useLanguage();
  const t = translations[language];

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
            <p className="text-sm text-cream/60 mb-2">{t.yourCode}</p>
            <p className="text-3xl font-serif text-gold tracking-widest">{code || t.codePending}</p>
          </div>

          <div className="space-y-4 text-left border-t border-white/5 pt-8 mb-10">
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" />
              {t.emailSent}
            </p>
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" />
              {t.driverContact}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-dark uppercase text-[10px] font-bold tracking-[3px] hover:bg-white transition-colors"
          >
            <Home size={16} /> {t.backHome}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}