import { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useApp } from '@/App';
import { isPasswordStrong } from '@/lib/data';

export function LoginModal() {
  const app = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await app.login(email, password);
    setSubmitting(false);
    if (success) { app.setShowLogin(false); setAttempts(0); }
    else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 6) setShowForgot(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2"><LogIn size={22} /> Login</h3>
          <button onClick={() => app.setShowLogin(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          </div>
          <div className="relative">
            <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${app.dark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          </div>
          {showForgot && (
            <button type="button" onClick={() => { app.setShowLogin(false); app.setShowRecovery(true); }}
              className="text-sm text-blue-500 font-medium flex items-center gap-1">
              <HelpCircle size={14} /> Forgot your password?
            </button>
          )}
          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold disabled:opacity-70">
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className={`text-center text-sm mt-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          No account? <button onClick={() => { app.setShowLogin(false); app.setShowRegister(true); }} className="text-emerald-500 font-bold">Register</button>
        </p>
      </div>
    </div>
  );
}

export function RegisterModal() {
  const app = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!isPasswordStrong(password)) { setError('Password must be at least 8 characters with letters, numbers, and special characters'); return; }
    setSubmitting(true);
    const success = await app.register(username, email, phone, address, password);
    setSubmitting(false);
    if (success) app.setShowRegister(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className={`w-full max-w-sm ${app.dark ? 'bg-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl my-4`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2"><UserPlus size={22} /> Register</h3>
          <button onClick={() => app.setShowRegister(false)}><X size={24} /></button>
        </div>
        <p className={`text-xs mb-4 -mt-3 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          You'll need an account to check out and track your order.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          <input type="text" placeholder="Address / Res Name & Room" required value={address} onChange={e => setAddress(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 chars, letters + numbers + special)" required value={password} onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm pr-10 ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${app.dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'}`} />
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold disabled:opacity-70">
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className={`text-center text-sm mt-4 ${app.dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account? <button onClick={() => { app.setShowRegister(false); app.setShowLogin(true); }} className="text-emerald-500 font-bold">Login</button>
        </p>
      </div>
    </div>
  );
}
