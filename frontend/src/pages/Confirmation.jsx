//confirmation transfert

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Confirmation() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get('code');

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

          <h1 className="font-serif text-4xl mb-4 text-white">Réservation Confirmée</h1>
          <p className="text-gold/60 uppercase tracking-[3px] text-xs mb-8">Merci pour votre confiance</p>
          
          <div className="bg-white/5 border border-white/10 p-6 mb-10">
            <p className="text-sm text-cream/60 mb-2">Votre code de confirmation :</p>
            <p className="text-3xl font-serif text-gold tracking-widest">{code || "EN COURS"}</p>
          </div>

          <div className="space-y-4 text-left border-t border-white/5 pt-8 mb-10">
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              Un email de confirmation vous a été envoyé.
            </p>
            <p className="text-sm flex items-center gap-3 text-cream/80">
              <CheckCircle size={16} className="text-gold" /> 
              Le chauffeur vous contactera sur WhatsApp.
            </p>
          </div>

          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-dark uppercase text-[10px] font-bold tracking-[3px] hover:bg-white transition-colors"
          >
            <Home size={16} /> Retour à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}