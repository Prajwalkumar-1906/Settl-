import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LogIn, KeyRound, AlertCircle, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

export function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'admin123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await googleLogin('alex.google@example.com', 'Alex Rivera (Google)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-['Outfit',sans-serif] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/3 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
          <Zap className="w-7 h-7 fill-white" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-wide">Settl</span>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs">Sign in to manage your group balances & settlements</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-medium text-cyan-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Settl</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-[#0b0f19] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Or Quick Demo Login
          </span>
        </div>

        {/* Quick Demo Accounts */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('alex@example.com')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Alex Rivera (Paris Trip Admin)</span>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300">alex@example.com</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('sarah@example.com')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Sarah Chen (Flat 4B Admin)</span>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300">sarah@example.com</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-extrabold text-cyan-400 hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
