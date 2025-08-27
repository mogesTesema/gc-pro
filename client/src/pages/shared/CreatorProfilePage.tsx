import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { profileAPI, ratingsAPI, chatAPI } from '../../api/client';
import { IProfile, IRating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PageLoading } from '../../components/common/index';
import {
  Star, Users, MapPin, ExternalLink, MessageSquare,
  Youtube, Globe, Twitter, ArrowLeft, Briefcase,
  Award, TrendingUp, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube:   <Youtube  size={14} className="text-red-500" />,
  tiktok:    <span className="text-xs font-black text-gray-900">TK</span>,
  instagram: <span className="text-xs font-black text-pink-600">IG</span>,
  twitter:   <Twitter  size={14} className="text-sky-500" />,
  website:   <Globe    size={14} className="text-blue-500" />,
};

const CreatorProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [ratings, setRatings] = useState<IRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        profileAPI.getById(userId),
        ratingsAPI.getUser(userId),
      ]);
      setProfile(pRes.data.profile);
      setRatings(rRes.data.ratings || []);
    } catch {
      toast.error('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const startChat = async () => {
    if (!userId) return;
    setChatLoading(true);
    try {
      const chats = await chatAPI.getMy();
      const existing = (chats.data.chats || []).find((c: any) =>
        c.participants?.some((p: any) => (p._id || p) === userId)
      );
      if (existing) {
        navigate(`/chat/${existing._id}`);
      } else {
        toast.error('Start a collaboration first to enable chat');
      }
    } catch {
      toast.error('Unable to open chat');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <PageLoading />;
  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-4">🔍</span>
      <p className="text-xl font-bold text-gray-800">Creator not found</p>
      <Link to="/creators" className="mt-4 text-blue-600 hover:underline">← Back to creators</Link>
    </div>
  );

  const u = profile.userId as any;
  const m = profile.performanceMetrics;
  const hasLinks = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm transition">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center text-white font-black text-3xl shrink-0">
              {u?.avatar
                ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-2xl" />
                : (u?.name?.[0] || '?').toUpperCase()
              }
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user && user._id !== userId && (
                <button
                  onClick={startChat}
                  disabled={chatLoading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm text-sm disabled:opacity-50"
                >
                  <MessageSquare size={15} />
                  {chatLoading ? 'Opening…' : 'Message'}
                </button>
              )}
              <Link to="/creators" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                All Creators
              </Link>
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900">{u?.name}</h1>
          {profile.platform && (
            <p className="text-sm text-blue-600 font-medium mt-0.5 capitalize">{profile.platform} Creator</p>
          )}
          {profile.location && (
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin size={13} /> {profile.location}
            </div>
          )}
          {profile.bio && (
            <p className="text-gray-600 text-sm leading-relaxed mt-3 max-w-2xl">{profile.bio}</p>
          )}

          {/* Niche tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.niche?.map(n => (
              <span key={n} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full capitalize font-medium">
                {n}
              </span>
            ))}
            {profile.skills?.map(s => (
              <span key={s} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Users size={18} className="text-blue-500" />, label: 'Followers', val: profile.followers?.toLocaleString() || '—', bg: 'bg-blue-50' },
          { icon: <TrendingUp size={18} className="text-green-500" />, label: 'Engagement', val: m?.engagementRate ? `${m.engagementRate}%` : '—', bg: 'bg-green-50' },
          { icon: <Star size={18} className="text-yellow-500" />, label: 'Avg Rating', val: m?.averageRating ? m.averageRating.toFixed(1) : '—', bg: 'bg-yellow-50' },
          { icon: <CheckCircle size={18} className="text-indigo-500" />, label: 'Collabs Done', val: m?.completedCollaborations ?? '—', bg: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div>{s.icon}</div>
            <div>
              <p className="text-lg font-black text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {(['overview', 'portfolio', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} {tab === 'reviews' && `(${ratings.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social links */}
          {hasLinks && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe size={16} className="text-blue-500" /> Social Links
              </h3>
              <div className="space-y-3">
                {profile.socialLinks && Object.entries(profile.socialLinks).map(([key, url]) => url ? (
                  <a key={key} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition group">
                    <span className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:border-blue-200">
                      {PLATFORM_ICONS[key] || <Globe size={14} />}
                    </span>
                    <span className="capitalize font-medium">{key}</span>
                    <ExternalLink size={12} className="ml-auto text-gray-400 group-hover:text-blue-500" />
                  </a>
                ) : null)}
              </div>
            </div>
          )}

          {/* Performance */}
          {m && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award size={16} className="text-purple-500" /> Performance Metrics
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Avg Views / Post',  val: m.avgViews?.toLocaleString() || '—' },
                  { label: 'Avg Likes / Post',  val: m.avgLikes?.toLocaleString() || '—' },
                  { label: 'Total Earnings',    val: m.totalEarnings ? `${m.totalEarnings.toLocaleString()} ETB` : '—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-bold text-gray-900">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div>
          {(!profile.portfolio || profile.portfolio.length === 0) ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No portfolio items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.portfolio.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noreferrer"
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
                    <ExternalLink size={18} className="text-blue-600" />
                  </div>
                  <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                  {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>}
                  <p className="text-xs text-blue-600 mt-2 truncate">{item.url}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {ratings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map(r => (
                <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {r.fromUserId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.fromUserId?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < r.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">"{r.comment}"</p>}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Communication: <strong>{r.communication}/5</strong></span>
                    <span>Quality: <strong>{r.qualityOfWork}/5</strong></span>
                    <span>Timeliness: <strong>{r.timeliness}/5</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorProfilePage;
