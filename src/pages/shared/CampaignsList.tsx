import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI } from '../../api/client';
import { ICampaign, IPagination } from '../../types';
import { Badge, EmptyState, Spinner } from '../../components/common/index';
import { Search, SlidersHorizontal, DollarSign, Calendar, Users, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES    = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education'];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];

const CampaignsList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9, sort: sortBy };
      if (search) params.search = search;
      if (selectedNiche) params.niche = selectedNiche;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;
      if (selectedPlatform) params.platform = selectedPlatform;
      const res = await campaignAPI.getAll(params);
      setCampaigns(res.data.campaigns || []);
      setPagination(res.data.pagination || null);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedNiche, sortBy, minBudget, maxBudget, selectedPlatform]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Campaigns</h1>
        <p className="text-gray-500 mt-1">
          {pagination?.total ?? 0} campaigns available
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search campaigns…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Latest</option>
          <option value="budget_high">Highest Budget</option>
          <option value="budget_low">Lowest Budget</option>
        </select>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition ${
            showFilters ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Niche</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedNiche(''); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${!selectedNiche ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
              >
                All
              </button>
              {NICHES.map((n) => (
                <button
                  key={n}
                  onClick={() => { setSelectedNiche(n.toLowerCase()); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedNiche === n.toLowerCase() ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Min Budget (ETB)</p>
              <input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="e.g. 1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Max Budget (ETB)</p>
              <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="e.g. 50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Platform</p>
              <select value={selectedPlatform} onChange={(e) => { setSelectedPlatform(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Platforms</option>
                {PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setSelectedNiche(''); setMinBudget(''); setMaxBudget(''); setSelectedPlatform(''); setPage(1); }}
            className="text-sm text-red-600 hover:text-red-700">
            Clear filters
          </button>
        </div>
      )}

      {/* Campaigns grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : campaigns.length === 0 ? (
        <EmptyState icon={<span className="text-5xl">🔍</span>} title="No campaigns found" description="Try different search terms or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {campaigns.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{c.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await campaignAPI.toggleBookmark(c._id);
                          setBookmarkedIds(prev => {
                            const next = new Set(prev);
                            res.data.bookmarked ? next.add(c._id) : next.delete(c._id);
                            return next;
                          });
                          toast.success(res.data.message);
                        } catch { toast.error('Login required to bookmark'); }
                      }}
                      className={`p-1.5 rounded-lg transition hover:bg-blue-50 ${
                        bookmarkedIds.has(c._id) ? 'text-blue-600' : 'text-gray-300 hover:text-blue-400'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark size={16} fill={bookmarkedIds.has(c._id) ? 'currentColor' : 'none'} />
                    </button>
                    <Badge status={c.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.niche.slice(0, 3).map((n) => (
                    <span key={n} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full capitalize">{n}</span>
                  ))}
                  {c.platform?.slice(0, 2).map(p => (
                    <span key={p} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full capitalize">{p}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-green-500" />
                    <span className="font-semibold text-gray-800">{c.budget.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    {c.duration} days
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-purple-500" />
                    {c.applicationsCount} applicants
                  </div>
                  {c.platform?.length > 0 && (
                    <div className="text-xs text-gray-500 capitalize">{c.platform[0]}</div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5">
                <Link
                  to={`/campaigns/${c._id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                >
                  View & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignsList;
