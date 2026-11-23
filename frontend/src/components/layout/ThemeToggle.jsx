import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm border border-hairline bg-surface text-ink text-xs font-medium hover:border-gold hover:text-gold transition-colors cursor-pointer"
    >
      {isDark ? <Sun size={15} className="text-gold" /> : <Moon size={15} className="text-gold" />}
      <span>{isDark ? 'Clair' : 'Sombre'}</span>
    </button>
  );
}