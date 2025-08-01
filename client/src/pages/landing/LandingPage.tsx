import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Users, MessageSquare, BarChart2, Shield, Star,
  ArrowRight, Play, CheckCircle, Sparkles, TrendingUp,
  Globe, Award, ChevronDown
} from 'lucide-react';

// ─── Counter animation ────────────────────────────────────
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({
  end, suffix = '', duration = 2000
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ─── Feature card ─────────────────────────────────────────
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string; delay?: number }> = ({
  icon, title, desc, color, delay = 0
}) => (
  <div
    className="card-lift bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

// ─── Step card ────────────────────────────────────────────
const StepCard: React.FC<{ num: string; title: string; desc: string; color: string }> = ({
  num, title, desc, color
}) => (
  <div className="flex gap-4">
    <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}>
      {num}
    </div>
    <div>
      <h4 className="font-bold text-gray-900">{title}</h4>
      <p className="text-gray-500 text-sm mt-1">{desc}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AACP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-indigo-600 transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={12} />
            AI-Powered Creator Marketplace
            <Sparkles size={12} />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Connect{' '}
            <span className="gradient-text">Creators</span>
            {' '}with{' '}
            <span className="gradient-text">Brands</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            AACP is the AI-powered platform that matches content creators with businesses
            for seamless advertising collaborations. Post campaigns, apply, chat, and grow — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register"
              className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg group">
              Start for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-lg">
              <Play size={18} className="fill-current" />
              See How It Works
            </a>
          </div>

          {/* Hero cards preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '🎯', title: 'AI Matching', val: '95%', label: 'Match accuracy' },
                { icon: '🚀', title: 'Fast Hiring', val: '48h', label: 'Average time to hire' },
                { icon: '⭐', title: 'Top Creators', val: '2K+', label: 'Verified creators' },
              ].map(({ icon, title, val, label }) => (
                <div key={title} className="glass rounded-2xl p-5 text-center card-lift shadow-lg">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-2xl font-extrabold text-gray-900">{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={24} className="text-gray-400" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-20 bg-gradient-to-br from-indigo-600 to-cyan-600">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { end: 2400, suffix: '+', label: 'Content Creators' },
              { end: 850, suffix: '+', label: 'Businesses' },
              { end: 12000, suffix: '+', label: 'Campaigns Posted' },
              { end: 98, suffix: '%', label: 'Satisfaction Rate' },
            ].map(({ end, suffix, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold mb-1">
                  <AnimatedCounter end={end} suffix={suffix} />
                </div>
                <div className="text-indigo-200 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Features</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">Everything You Need</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Powerful tools for creators and businesses to collaborate efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Sparkles size={22} className="text-indigo-600" />} color="bg-indigo-50"
              title="AI-Powered Matching" delay={0}
              desc="Gemini AI analyzes creator profiles and campaign requirements to deliver perfect match scores with reasoning." />
            <FeatureCard icon={<MessageSquare size={22} className="text-cyan-600" />} color="bg-cyan-50"
              title="Real-Time Chat" delay={100}
              desc="Socket.IO-powered instant messaging between creators and businesses with read receipts and typing indicators." />
            <FeatureCard icon={<Shield size={22} className="text-green-600" />} color="bg-green-50"
              title="Verified Profiles" delay={200}
              desc="All creator and business profiles go through admin approval to ensure quality and authenticity." />
            <FeatureCard icon={<BarChart2 size={22} className="text-purple-600" />} color="bg-purple-50"
              title="Creator Analytics" delay={300}
              desc="Track engagement rates, average views, collaboration history, and ratings to make data-driven decisions." />
            <FeatureCard icon={<Globe size={22} className="text-orange-500" />} color="bg-orange-50"
              title="Multi-Platform" delay={400}
              desc="Filter creators by YouTube, TikTok, Instagram, Twitter and more. Reach the right audience on the right platform." />
            <FeatureCard icon={<Award size={22} className="text-yellow-500" />} color="bg-yellow-50"
              title="Rating System" delay={500}
              desc="After each collaboration, both parties rate each other across 5 dimensions building trust on the platform." />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Creators */}
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-3xl p-8 border border-indigo-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Creators</h3>
              </div>
              <div className="space-y-6">
                <StepCard num="1" color="bg-indigo-500" title="Create Your Profile"
                  desc="Add your niche, skills, follower count and portfolio to stand out." />
                <StepCard num="2" color="bg-cyan-500" title="Get Approved"
                  desc="Admin reviews your profile to ensure quality for businesses." />
                <StepCard num="3" color="bg-purple-500" title="Browse & Apply"
                  desc="Explore campaigns matching your niche and apply with a message." />
                <StepCard num="4" color="bg-green-500" title="Collaborate & Earn"
                  desc="Chat, deliver work, and build your reputation with ratings." />
              </div>
            </div>

            {/* Businesses */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border border-orange-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Businesses</h3>
              </div>
              <div className="space-y-6">
                <StepCard num="1" color="bg-orange-500" title="Post a Campaign"
                  desc="Describe your campaign, budget, niche requirements, and platform." />
                <StepCard num="2" color="bg-pink-500" title="Review Applicants"
                  desc="Receive applications with AI match scores for each creator." />
                <StepCard num="3" color="bg-red-500" title="Hire the Best Fit"
                  desc="Accept one creator — a private chat opens automatically." />
                <StepCard num="4" color="bg-indigo-500" title="Track & Rate"
                  desc="Monitor deliverables, mark completion, and rate the creator." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900">Loved by Creators & Brands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Meron T.', role: 'Tech Creator · 85K followers', rating: 5,
                quote: 'AACP matched me with a perfect tech startup campaign. The AI recommendations were spot-on and the chat made collaboration seamless.' },
              { name: 'Dagmawi K.', role: 'Business Owner · E-commerce', rating: 5,
                quote: 'Found an incredible creator in under 24 hours. The AI scoring saved us so much time reviewing applicants. Highly recommend!' },
              { name: 'Hana B.', role: 'Lifestyle Creator · 120K followers', rating: 5,
                quote: 'The profile system and ratings build real trust. I\'ve completed 12 collaborations through AACP and every one was professional.' },
            ].map(({ name, role, rating, quote }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-lift">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <div className="text-5xl mb-4 float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Ready to Grow Together?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Join thousands of creators and businesses already collaborating on AACP.
            Start free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=creator"
              className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl text-lg flex items-center gap-2 justify-center">
              Join as Creator <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=business"
              className="border-2 border-white/50 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-lg flex items-center gap-2 justify-center">
              Join as Business <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">AACP</span>
              <span className="text-sm ml-2">AI Advertisement Collaboration Platform</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {['Features', 'How It Works', 'About'].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} AACP. Built with ❤️ for African creators and businesses.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
