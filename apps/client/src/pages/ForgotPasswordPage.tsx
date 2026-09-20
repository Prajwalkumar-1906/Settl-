import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [demoResetUrl, setDemoResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDemoResetUrl(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send reset email');

      setMessage(data.message);
      if (data.resetUrlDemo) {
        setDemoResetUrl(data.resetUrlDemo);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-['Outfit',sans-serif] relative overflow-hidden">
      <div className="fixed top-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
          <Zap className="w-7 h-7 fill-white" />
        </div>
        <span className="text-3xl font-extrabold text-white tracking-wide">Settl</span>
      </Link>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-slate-400 text-xs">Enter your email and we'll send you a password reset link</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            {demoResetUrl && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1 break-all">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Dev Direct Link:</div>
                <a href={demoResetUrl} className="text-cyan-400 hover:underline">
                  {demoResetUrl}
                </a>
              </div>
            )}
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
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending Link...</span>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
