import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  loading: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignIn, onSignUp, loading }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let success: boolean;
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Por favor, insira seu nome.');
          setSubmitting(false);
          return;
        }
        success = await onSignUp(email, password, displayName);
      } else {
        success = await onSignIn(email, password);
      }

      if (!success) {
        setError(isSignUp ? 'Erro ao criar conta. Verifique os dados.' : 'Email ou senha incorretos.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <BrainCircuit className="text-tertiary" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/3 to-tertiary/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-tertiary mb-6 shadow-[0_0_40px_rgba(208,149,255,0.3)]"
          >
            <BrainCircuit className="text-surface" size={40} />
          </motion.div>
          <h1 className="font-headline text-4xl font-bold text-on-background tracking-tight mb-2">
            Kinetic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Math</span>
          </h1>
          <p className="text-on-surface-variant text-sm">
            Domine a matemática com exercícios interativos
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/15 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-tertiary/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Tab toggle */}
            <div className="flex bg-surface-container-high rounded-xl p-1 mb-8">
              <button
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-3 rounded-lg font-label text-sm uppercase tracking-widest font-bold transition-all ${
                  !isSignUp 
                    ? 'bg-gradient-to-r from-primary to-tertiary text-surface shadow-lg' 
                    : 'text-outline hover:text-on-background'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-3 rounded-lg font-label text-sm uppercase tracking-widest font-bold transition-all ${
                  isSignUp 
                    ? 'bg-gradient-to-r from-primary to-tertiary text-surface shadow-lg' 
                    : 'text-outline hover:text-on-background'
                }`}
              >
                Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (sign up only) */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block">
                    <span className="font-label text-xs text-outline uppercase tracking-wider mb-2 block">
                      Nome de exibição
                    </span>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-background placeholder:text-outline/40 focus:ring-2 focus:ring-tertiary/40 outline-none border-none transition-all font-body"
                        placeholder="Como quer ser chamado?"
                      />
                    </div>
                  </label>
                </motion.div>
              )}

              {/* Email field */}
              <label className="block">
                <span className="font-label text-xs text-outline uppercase tracking-wider mb-2 block">
                  Email
                </span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-4 text-on-background placeholder:text-outline/40 focus:ring-2 focus:ring-tertiary/40 outline-none border-none transition-all font-body"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </label>

              {/* Password field */}
              <label className="block">
                <span className="font-label text-xs text-outline uppercase tracking-wider mb-2 block">
                  Senha
                </span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest rounded-xl py-4 pl-12 pr-12 text-on-background placeholder:text-outline/40 focus:ring-2 focus:ring-tertiary/40 outline-none border-none transition-all font-body"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-background transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-body"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-primary to-tertiary text-surface font-headline font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(208,149,255,0.3)] hover:shadow-[0_0_40px_rgba(129,236,255,0.5)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={22} />
                  </motion.div>
                ) : (
                  <>
                    {isSignUp ? 'Criar Conta' : 'Acessar'}
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-outline text-xs mt-8">
          © 2024 Kinetic Math — The Neon Mathematical Infinite
        </p>
      </motion.div>
    </div>
  );
};
