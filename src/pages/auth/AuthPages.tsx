import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const FLOATING_STATS = [
  { label: 'Active Creators', value: '10K+', color: 'from-blue-500 to-blue-600', delay: '0s' },
  { label: 'Campaigns Live',  value: '2.4K+', color: 'from-purple-500 to-purple-600', delay: '0.3s' },
  { label: 'AI Match Rate',   value: '96%',   color: 'from-green-500 to-teal-500',   delay: '0.6s' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your AACP account">
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField icon={<Mail size={16} />} label="Email Address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com" />
      <InputField icon={<Lock size={16} />} label="Password" type={showPw ? 'text' : 'password'}
        value={password} onChange={setPassword} placeholder="Your password"
        rightIcon={
          <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-blue-600 transition">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <div className="flex justify-end">
        <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</a>
      </div>
      <AuthButton loading={loading} label="Sign In" />
    </form>
    <p className="text-center text-sm text-gray-500 mt-6">
      Don't have an account?{' '}
      <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one →</Link>
    </p>
  </AuthLayout>;
};

export const RegisterPage: React.FC = () => {
  const [step, setStep]         = useState(1);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'creator' | 'business'>('creator');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created! Welcome to AACP 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return <AuthLayout title="Join AACP" subtitle="Create your account and start collaborating">
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">I am a…</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: 'creator',  label: 'Content Creator', emoji: '🎥', desc: 'I make content & want brand deals' },
            { val: 'business', label: 'Business Owner',   emoji: '🏢', desc: 'I want to promote my brand' },
          ].map(({ val, label, emoji, desc }) => (
            <button key={val} type="button" onClick={() => setRole(val as any)}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition ${
                role === val
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <span className="text-2xl mb-1">{emoji}</span>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <InputField icon={<span className="text-sm">👤</span>} label="Full Name" type="text"
        value={name} onChange={setName} placeholder="Abebe Kebede" />
      <InputField icon={<Mail size={16} />} label="Email Address" type="email"
        value={email} onChange={setEmail} placeholder="you@example.com" />
      <InputField icon={<Lock size={16} />} label="Password" type={showPw ? 'text' : 'password'}
        value={password} onChange={setPassword} placeholder="Min 6 characters"
        rightIcon={
          <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-blue-600 transition">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {/* Password strength */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                password.length >= i * 3 ? (password.length >= 10 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-gray-200'
              }`} />
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {password.length < 6 ? 'Too short' : password.length < 10 ? 'Could be stronger' : 'Strong password ✓'}
          </p>
        </div>
      )}

      <AuthButton loading={loading} label="Create Account" />

      <p className="text-xs text-center text-gray-400">
        By signing up, you agree to our <a href="#" className="text-blue-500 hover:underline">Terms</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
      </p>
    </form>

    <p className="text-center text-sm text-gray-500 mt-4">
      Already have an account?{' '}
      <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in →</Link>
    </p>
  </AuthLayout>;
};

// ─── Shared layout ────────────────────────────────────────
const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex">
    {/* Left: form */}
    <div className="flex-1 flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <span className="text-white font-black">A</span>
          </div>
          <span className="font-black text-xl text-gray-900">AACP</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>

    {/* Right: hero panel */}
    <div className="hidden lg:flex flex-1 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0F1340 0%, #1E2A8C 50%, #4F6EF7 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-32 left-12 w-64 h-64 bg-purple-500 rounded-full opacity-15 blur-3xl float" />
      <div className="absolute bottom-20 right-12 w-48 h-48 bg-blue-400 rounded-full opacity-20 blur-2xl" style={{ animation: 'float 5s ease-in-out infinite reverse' }} />

      <div className="relative flex flex-col justify-center px-12 text-white">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-4">
            <Sparkles size={16} /> AI-Powered Platform
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Where Creators<br />Meet Opportunity
          </h2>
          <p className="text-blue-100 leading-relaxed max-w-sm">
            Connect with top brands, land exciting campaigns, and grow your creator career with the power of AI.
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="space-y-3">
          {FLOATING_STATS.map(({ label, value, color, delay }) => (
            <div key={label} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 animate-slide-up"
              style={{ animationDelay: delay }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                {value}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{value}</p>
                <p className="text-blue-200 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Review quote */}
        <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex gap-1 mb-2">{Array.from({length:5}).map((_,i)=><span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
          <p className="text-blue-100 text-sm italic">"Found my first brand deal within 48 hours of signing up!"</p>
          <p className="text-blue-300 text-xs mt-2 font-medium">— Meron T., TikTok Creator</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Reusable input ───────────────────────────────────────
const InputField: React.FC<{
  icon: React.ReactNode; label: string; type: string;
  value: string; onChange: (v: string) => void;
  placeholder: string; rightIcon?: React.ReactNode;
}> = ({ icon, label, type, value, onChange, placeholder, rightIcon }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3.5 text-gray-400">{icon}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus-ring transition hover:border-gray-300 font-medium" />
      {rightIcon && <span className="absolute right-3.5">{rightIcon}</span>}
    </div>
  </div>
);

// ─── Submit button ────────────────────────────────────────
const AuthButton: React.FC<{ loading: boolean; label: string }> = ({ loading, label }) => (
  <button type="submit" disabled={loading}
    className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-blue-500/25 mt-2">
    {loading ? (
      <span className="flex gap-1">
        {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full bounce-dot" style={{ animationDelay: `${i*0.15}s` }} />)}
      </span>
    ) : (<>{label} <ArrowRight size={16} /></>)}
  </button>
);
