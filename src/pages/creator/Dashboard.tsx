import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { campaignAPI, applicationAPI } from '../../api/client';
import { ICampaign, IApplication } from '../../types';
import { StatCard, Badge, PageLoading, EmptyState } from '../../components/common/index';
import { FileText, CheckCircle, Star, ArrowRight, Clock, TrendingUp, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education'];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
};

const CreatorDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { onlineUsers, isConnected } = useSocket();
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          campaignAPI.getAll({ limit: 12 }),
          applicationAPI.getMy(),
        ]);
        setCampaigns(cRes.data.campaigns || []);
        setApplications(aRes.data.applications || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setUpdatedAt(Date.now()), 8000);
    return () => clearInterval(tick);
  }, []);

  const CampaignFeed: React.FC<{ items: ICampaign[] }> = ({ items }) => {
    const [nicheFilter, setNicheFilter] = useState('');
    const visible = !nicheFilter
      ? items
      : items.filter((c) => c.niche.some((n) => n.toLowerCase() === nicheFilter));

    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-900">Latest Campaigns</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Updated {new Date(updatedAt).toLocaleTimeString()} · {onlineUsers.length} online
              {isConnected ? '' : ' (connecting)'}
            </p>
          </div>
          <Link to="/campaigns" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="px-6 py-3 border-b flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNicheFilter('')}
            className={`px-3 py-1 rounded-full text-xs border ${!nicheFilter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}
          >
            All
          </button>
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNicheFilter(n.toLowerCase())}
              className={`px-3 py-1 rounded-full text-xs border ${nicheFilter === n.toLowerCase() ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <EmptyState title="No campaigns in this niche" description="Try another filter." />
        ) : (
          <div className="divide-y">
            {visible.map((c) => (
              <div key={c._id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.niche.slice(0, 3).map((n) => (
                        <span key={n} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{c.budget.toLocaleString()} ETB</p>
                    <p className="text-xs text-gray-500">{c.duration} days</p>
                    <Link to={`/campaigns/${c._id}`}
                      className="mt-2 inline-block text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <PageLoading />;

  const pending  = applications.filter((a) => a.status === 'pending').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;
  const done     = profile?.performanceMetrics?.completedCollaborations || 0;
  const rating   = profile?.performanceMetrics?.averageRating || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {profile?.approvalStatus === 'approved'
            ? 'Your profile is live. Explore campaigns and start earning!'
            : profile?.approvalStatus === 'rejected'
            ? `Profile rejected: ${profile?.rejectionReason || 'Update your profile and resubmit.'}`
            : 'Your profile is awaiting admin approval (usually takes 24h).'}
        </p>
        {profile?.approvalStatus !== 'approved' && (
          <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
            profile?.approvalStatus === 'rejected'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            <Clock size={14} />
            {profile?.approvalStatus === 'rejected' ? 'Update your profile' : 'Profile under review'}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Coins size={22} />}       title="Coin Balance"  value={user?.coinBalance ?? 0}              color="yellow" subtitle="Use coins to apply" />
        <StatCard icon={<FileText size={22} />}    title="Pending Apps"  value={pending}                             color="orange" subtitle="Awaiting review" />
        <StatCard icon={<CheckCircle size={22} />} title="Accepted"      value={accepted}                            color="green"  subtitle="Active collabs" />
        <StatCard icon={<Star size={22} />}        title="Avg Rating"    value={rating ? `${rating}/5` : '—'}        color="purple" subtitle={`${done} jobs done`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CampaignFeed items={campaigns} />

        {/* My applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-gray-900">My Applications</h2>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              All <ArrowRight size={14} />
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState title="No applications yet" action={
              <Link to="/campaigns" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Browse Campaigns
              </Link>
            } />
          ) : (
            <div className="divide-y">
              {applications.slice(0, 6).map((a) => (
                <div key={a._id} className="px-6 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(a.campaignId as any)?.title || 'Campaign'}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge status={a.status} />
                    {a.status === 'accepted' && a.chatId && (
                      <Link to={`/chat/${a.chatId}`} className="text-xs text-blue-600 hover:underline">
                        Chat →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance */}
      {done > 0 && profile?.performanceMetrics && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Performance Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Avg Views', val: (profile.performanceMetrics.avgViews || 0).toLocaleString() },
              { label: 'Engagement', val: `${profile.performanceMetrics.engagementRate || 0}%` },
              { label: 'Jobs Done', val: done },
              { label: 'Avg Rating', val: `⭐ ${rating.toFixed(1)}` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900">{val}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
