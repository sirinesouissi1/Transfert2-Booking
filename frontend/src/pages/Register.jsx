import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';

export default function Register() {
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen bg-dark-DEFAULT flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background image avec overlay amélioré */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1539622106114-e0df812097e6?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-DEFAULT/80 via-dark-DEFAULT/60 to-dark-DEFAULT/90" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="font-serif text-4xl tracking-[8px] text-cream hover:text-gold transition-colors duration-300"
          >
            LUMIN<span className="text-gold">A</span>
          </Link>
          <p className="text-muted text-sm mt-3 font-light tracking-wide">
            Rejoignez l'expérience exclusive
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-dark-3/90 backdrop-blur-sm border border-gold/20 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Ligne Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1 ml-1">
                  Prénom
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    {...register('firstName', { required: 'Prénom requis' })}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-2/80 border rounded-lg text-cream placeholder:text-muted/50 focus:outline-none focus:ring-2 transition ${
                      errors.firstName
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-gold/20 focus:border-gold focus:ring-gold/20'
                    }`}
                    placeholder="Jean"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.firstName.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1 ml-1">
                  Nom
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    {...register('lastName', { required: 'Nom requis' })}
                    className={`w-full pl-10 pr-4 py-3 bg-dark-2/80 border rounded-lg text-cream placeholder:text-muted/50 focus:outline-none focus:ring-2 transition ${
                      errors.lastName
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-gold/20 focus:border-gold focus:ring-gold/20'
                    }`}
                    placeholder="Dupont"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1 ml-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1 ml-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  {...register('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email invalide',
                    },
                  })}
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 bg-dark-2/80 border rounded-lg text-cream placeholder:text-muted/50 focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-gold/20 focus:border-gold focus:ring-gold/20'
                  }`}
                  placeholder="vous@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1 ml-1">
                Téléphone (optionnel)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 bg-dark-2/80 border border-gold/20 rounded-lg text-cream placeholder:text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1 ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  {...register('password', {
                    required: 'Mot de passe requis',
                    minLength: {
                      value: 6,
                      message: 'Minimum 6 caractères',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-3 bg-dark-2/80 border rounded-lg text-cream placeholder:text-muted/50 focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-gold/20 focus:border-gold focus:ring-gold/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 mt-6 bg-gradient-to-r from-gold to-gold-light text-dark font-medium rounded-lg overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-dark" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Création...</span>
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6 font-light">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-gold hover:text-gold-light transition-colors font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}