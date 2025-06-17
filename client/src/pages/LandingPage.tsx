import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, Users, MessageSquare, Zap, Star, TrendingUp,
  ArrowRight, Check, Bot, Shield, Globe, Play, ChevronRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 40 ? 'glass shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-gray-900">AACP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features"    className="hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition px-4 py-2">Log in</Link>
            <Link to="/register" className="text-sm font-semibold bg-gradient-brand text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-md">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0F1340 0%, #1E2A8C 45%, #4F6EF7 100%)' }}>
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400 rounded-full opacity-15 blur-3xl" style={{ animation: 'float 4s ease-in-out infinite reverse' }} />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
              AI-Powered Advertising Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
              Connect Creators
              <br />
              <span style={{ background: 'linear-gradient(90deg, #A78BFA, #60A5FA, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                With Brands
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              AACP is the AI-powered marketplace where businesses find perfect creators and creators land their dream campaigns — faster than ever before.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="group flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition shadow-xl text-base">
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="flex items-center gap-2 text-white/90 font-medium px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition text-base">
                <Play size={16} /> See How It Works
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-16 pt-10 border-t border-white/10">
              {[
                { val: '10K+', label: 'Active Creators' },
                { val: '2.4K+', label: 'Campaigns Posted' },
                { val: '98%', label: 'Satisfaction Rate' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-white">{val}</p>
                  <p className="text-xs text-blue-200 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card preview */}
          <div className="mt-16 max-w-4xl mx-auto relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-1 border border-white/20 shadow-2xl">
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-3 flex items-center gap-2">
                  {['#FF605C','#FFBD44','#00CA4E'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                  <div className="flex-1 mx-4">
                    <div className="bg-white/10 rounded-full h-5 w-48 mx-auto flex items-center justify-center">
                      <span className="text-white/60 text-xs">app.aacp.io/dashboard</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos ─── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by creators and businesses across Ethiopia & beyond</p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-40">
            {['YouTube', 'TikTok', 'Instagram', 'Meta', 'Snapchat'].map(b => (
              <span key={b} className="text-gray-600 font-black text-lg">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">Platform Features</span>
          <h2 className="text-4xl font-black text-gray-900 mt-4 mb-4">Everything you need to <br /><span className="gradient-text">collaborate & grow</span></h2>
          <p className="text-gray-500 max-w-xl mx-auto">From AI-powered matching to real-time collaboration, AACP has every tool you need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card card-hover group animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/20 px-4 py-1.5 rounded-full">Simple Process</span>
            <h2 className="text-4xl font-black text-white mt-4 mb-4">Get started in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-3">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title} className="flex gap-4 bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/10 transition group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-black text-sm shrink-0 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{step.title}</p>
                    <p className="text-blue-200 text-sm mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
                <div className="space-y-4">
                  {MINI_CAMPAIGN_CARDS.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-xl`}>{card.emoji}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{card.title}</p>
                        <p className="text-gray-500 text-xs">{card.sub}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.badge}`}>{card.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900">Loved by creators & brands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 card-hover">
              <div className="flex gap-1 mb-4">
                {Array.from({length: 5}).map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: t.color }}>{t.name[0]}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 mx-6 mb-12 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4F6EF7, #8B5CF6)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full opacity-5 -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full opacity-5 translate-y-20 -translate-x-20" />
        <div className="max-w-2xl mx-auto text-center relative px-6">
          <h2 className="text-4xl font-black text-white mb-4">Ready to grow together?</h2>
          <p className="text-blue-100 mb-8">Join thousands of creators and businesses already collaborating on AACP.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=creator" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition shadow-xl">
              I'm a Creator →
            </Link>
            <Link to="/register?role=business" className="bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition">
              I'm a Business →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-bold text-gray-900">AACP</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 AACP. AI Advertisement Collaboration Platform.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Mini dashboard preview
const DashboardPreview: React.FC = () => (
  <div className="grid grid-cols-4 gap-3">
    {[
      { label: 'Campaigns', val: '24', color: 'bg-blue-50 text-blue-600' },
      { label: 'Applicants', val: '186', color: 'bg-purple-50 text-purple-600' },
      { label: 'Active', val: '8', color: 'bg-green-50 text-green-600' },
      { label: 'Coins', val: '340', color: 'bg-yellow-50 text-yellow-600' },
    ].map(({ label, val, color }) => (
      <div key={label} className={`${color} rounded-xl p-3 text-center`}>
        <p className="text-xl font-black">{val}</p>
        <p className="text-xs opacity-70 mt-0.5">{label}</p>
      </div>
    ))}
    <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <p className="text-xs font-semibold text-gray-700 mb-2">Recent Campaign</p>
      <p className="font-bold text-sm text-gray-900">TikTok Product Launch</p>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-green-600 font-medium">● Open</span>
        <span className="text-xs text-gray-500">12 applicants</span>
      </div>
    </div>
    <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <p className="text-xs font-semibold text-gray-700 mb-2">Top Creator Match</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">S</div>
        <div>
          <p className="text-xs font-bold text-gray-900">Sara Tesfaye</p>
          <p className="text-xs text-purple-600">🤖 96/100 match</p>
        </div>
      </div>
    </div>
  </div>
);

const FEATURES = [
  { icon: Bot,         title: 'AI-Powered Matching',    desc: 'Gemini AI analyzes creator profiles and ranks them by campaign fit — get match scores and engagement predictions instantly.', bg: 'bg-purple-50', color: 'text-purple-600' },
  { icon: MessageSquare, title: 'Real-Time Chat',        desc: 'Socket.IO-powered messaging with typing indicators, read receipts, and instant delivery. Collaborate without leaving the platform.', bg: 'bg-blue-50', color: 'text-blue-600' },
  { icon: Shield,      title: 'Secure Coin Economy',    desc: 'A built-in coin system keeps the ecosystem fair. Post campaigns and apply to opportunities — all tracked transparently.', bg: 'bg-green-50', color: 'text-green-600' },
  { icon: TrendingUp,  title: 'Performance Analytics',  desc: 'Track engagement rates, average views, and completed collaborations. Businesses see ROI predictions before hiring.', bg: 'bg-orange-50', color: 'text-orange-600' },
  { icon: Globe,       title: 'Multi-Platform Support', desc: 'YouTube, TikTok, Instagram, Twitter, and more. Filter creators by the exact platform your campaign needs.', bg: 'bg-teal-50', color: 'text-teal-600' },
  { icon: Star,        title: 'Verified Ratings',       desc: 'Mutual ratings after every collaboration build a trustworthy reputation system. See who delivers before you hire.', bg: 'bg-yellow-50', color: 'text-yellow-600' },
];

const HOW_IT_WORKS = [
  { title: 'Create your account',       desc: 'Register as a Creator or Business Owner — it takes under a minute.' },
  { title: 'Complete your profile',     desc: 'Creators add their niche, portfolio & social links. Businesses add company info.' },
  { title: 'Post or browse campaigns',  desc: 'Businesses post campaigns; creators browse and apply to best-fit opportunities.' },
  { title: 'Let AI rank the applicants', desc: 'Business owners use AI to rank creators by match score, predicted ROI, and engagement.' },
  { title: 'Collaborate & get paid',    desc: 'Chat in real-time, complete the work, rate each other, and build your reputation.' },
];

const MINI_CAMPAIGN_CARDS = [
  { emoji: '📱', title: 'TikTok Brand Review', sub: '50,000+ followers', color: 'bg-pink-50', badge: 'bg-green-100 text-green-700', status: 'Open' },
  { emoji: '🎥', title: 'YouTube Sponsorship',  sub: 'Tech & Lifestyle niche', color: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', status: 'Active' },
  { emoji: '📸', title: 'Instagram Campaign',   sub: 'Fashion & Beauty',       color: 'bg-purple-50', badge: 'bg-yellow-100 text-yellow-700', status: '12 Apps' },
];

const TESTIMONIALS = [
  { name: 'Liya Abebe',     role: 'Content Creator · TikTok',   color: '#4F6EF7', quote: 'AACP completely changed how I find brand deals. The AI matching found me campaigns I never would have discovered on my own.' },
  { name: 'Samuel Girma',   role: 'Business Owner · E-Commerce', color: '#8B5CF6', quote: 'We hired 3 creators within a week of posting our first campaign. The AI ranking saved us hours of manual review.' },
  { name: 'Hana Tesfaye',   role: 'YouTuber · Tech Niche',       color: '#10B981', quote: 'The chat feature makes collaboration so smooth. No more scattered WhatsApp threads — everything is in one place.' },
];

export default LandingPage;
