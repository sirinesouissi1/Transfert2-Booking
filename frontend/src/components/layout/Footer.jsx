import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark-2 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-serif text-2xl tracking-[6px] text-cream font-light mb-4 block">
              GO<span className="text-gold">TAXI</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed font-light mb-6">
              Votre partenaire premium pour les transferts et excursions en Tunisie.
            </p>
            <div className="flex gap-3">
              {[FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-gold/20 flex items-center justify-center text-muted hover:border-gold hover:text-gold transition-all">
                  <Icon className="w-3 h-3" />
                </a>
              ))}
            </div>
            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-gold text-[10px] tracking-[3px] uppercase mb-3">Newsletter</p>
              <div className="flex border border-gold/20">
                <input type="email" placeholder="votre@email.com" className="bg-transparent px-4 py-3 text-sm text-cream placeholder:text-muted outline-none flex-1 font-light" />
                <button className="bg-gold text-dark-DEFAULT px-4 py-3 text-sm hover:bg-gold-light transition-colors">→</button>
              </div>
            </div>
          </div>

          {/* Transferts */}
          <div>
            <h4 className="text-gold text-[10px] tracking-[3px] uppercase mb-6">Transferts</h4>
            <ul className="space-y-3">
              {['Aéroport Tunis-Carthage', 'Aéroport de Monastir', 'Aéroport d\'Enfidha', 'Aéroport de Djerba'].map(item => (
                <li key={item}><Link to="/transferts" className="text-muted text-sm font-light hover:text-cream transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Excursions */}
          <div>
            <h4 className="text-gold text-[10px] tracking-[3px] uppercase mb-6">Excursions</h4>
            <ul className="space-y-3">
              {['Tunis & Carthage', 'Sahara & Douz', 'Kairouan & El Jem', 'Sidi Bou Saïd', 'Dougga & Bulla Regia'].map(item => (
                <li key={item}><Link to="/excursions" className="text-muted text-sm font-light hover:text-cream transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold text-[10px] tracking-[3px] uppercase mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="text-sm text-muted font-light">
                <span className="text-gold block text-[10px] tracking-[2px] uppercase mb-1">Email</span>
                contact@GoTaxi-tunisia.com
              </li>
              <li className="text-sm text-muted font-light">
                <span className="text-gold block text-[10px] tracking-[2px] uppercase mb-1">WhatsApp</span>
                +216 XX XXX XXX
              </li>
              <li className="text-sm text-muted font-light">
                <span className="text-gold block text-[10px] tracking-[2px] uppercase mb-1">Disponibilité</span>
                7j/7 · 24h/24
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs tracking-wider">© 2026 GoTaxi Tunisia · Tous droits réservés</p>
          <div className="flex gap-6">
            <Link to="#" className="text-muted text-xs hover:text-gold transition-colors">Confidentialité</Link>
            <Link to="#" className="text-muted text-xs hover:text-gold transition-colors">CGV</Link>
            <Link to="#" className="text-muted text-xs hover:text-gold transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
