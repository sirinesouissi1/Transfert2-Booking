import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-DEFAULT">
      <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
      <p className="text-cream text-sm uppercase tracking-widest animate-pulse">
        Chargement...
      </p>
    </div>
  );
}