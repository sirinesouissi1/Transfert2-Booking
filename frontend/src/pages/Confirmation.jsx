// confirmation transfert

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext'; // <-- AJOUT

// --- AJOUT DES TRADUCTIONS ---
const translations = {
  fr: {
    title: "Demande Enregistrée",
    subtitle: "Votre réservation est en cours de confirmation",
    yourCode: "Votre code de référence :",
    codePending: "EN COURS",
    emailSent: "Un email récapitulatif vous a été envoyé.",
    driverContact: "Nous vous contacterons sur WhatsApp pour confirmer votre réservation.",
    statusInfo: "Statut actuel : En attente de confirmation",
    backHome: "Retour à l'accueil",
  },
  en: {
    title: "Request Received",
    subtitle: "Your booking is being confirmed",
    yourCode: "Your reference code:",
    codePending: "IN PROGRESS",
    emailSent: "A summary email has been sent to you.",
    driverContact: "We will contact you on WhatsApp to confirm your booking.",
    statusInfo: "Current status: Pending confirmation",
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
            <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold">
              <CheckCircle size={48} />
            </div>
          </div>

          <h1 className="font-serif text-4xl mb-4 text-white">{t.title}</h1>
          <p className="text-gold/60 uppercase tracking-[3px] text-xs mb-8">{t.subtitle}</p>

          <div className="bg-white/5 border border-white/10 p-6 mb-6">
            <p className="text-sm text-cream/60 mb-2">{t.yourCode}</p>
            <p className="text-3xl font-serif text-gold tracking-widest">{code || t.codePending}</p>
          </div>

          {/* ✅ Badge de statut : en attente de confirmation */}
          <div className="flex items-center justify-center gap-2 mb-10 text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-4 py-2 rounded text-xs uppercase tracking-wider">
            <Clock size={14} />
            {t.statusInfo}
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