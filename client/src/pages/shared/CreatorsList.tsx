import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI, aiAPI } from '../../api/client';
import { IProfile } from '../../types';
import { PageLoading, EmptyState, Avatar, Spinner } from '../../components/common/index';
import { Search, SlidersHorizontal, Star, Users, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES    = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education'];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];

const CreatorsList: React.FC = () => {
  const [creators, setCreators] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ niche: '', platform: '', location: '', minFollowers: '', sort: 'recent' });

  const setFilter = (k: string, v: string) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); };

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 9, sort: filters.sort };
      if (filters.niche)        params.niche        = filters.niche;
      if (filters.platform)     params.platform     = filters.platform;
      if (filters.location)     params.location     = filters.location;
      if (filters.minFollowers) params.minFollowers  = filters.minFollowers;
      const res = await profileAPI.getCreators(params);
      setCreators(res.data.profiles || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 0);
    } catch {
      toast.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const clearFilters = () => { setFilters({ niche: '', platform: '', location: '', minFollowers: '', sort: 'recent' }); setPage(1); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Creators</h1>
        <p className="text-gray-500 mt-1">{total} approved creators on the platform</p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input value={filters.location} onChange={(e) => setFilter('location', e.target.value)}
            placeholder="Filter by location…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="recent">Latest</option>
          <option value="followers">Most Followers</option>
          <option value="rating">Highest Rated</option>
        </select>
        <button onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Niche</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter('niche', '')}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${!filters.niche ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>All</button>
              {NICHES.map((n) => (
                <button key={n} onClick={() => setFilter('niche', n.toLowerCase())}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${filters.niche === n.toLowerCase() ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Platform</p>
              <select value={filters.platform} onChange={(e) => setFilter('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Any</option>
                {PLATFORMS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Min Followers</p>
              <input type="number" value={filters.minFollowers} onChange={(e) => setFilter('minFollowers', e.target.value)}
                placeholder="e.g. 10000" min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600">Clear all filters</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : creators.length === 0 ? (
        <EmptyState icon={<span className="text-5xl">🔍</span>} title="No creators found" description="Try different filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {creators.map((creator) => {
            const u = creator.userId as any;
            const metrics = creator.performanceMetrics;
            return (
              <div key={creator._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition flex flex-col">
                <div className="p-5 flex-1">
                  {/* Creator header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={u?.name || 'Creator'} avatar={u?.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{u?.name}</p>
                      {creator.platform && (
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{creator.platform}</p>
                      )}
                      {(metrics?.averageRating ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{metrics?.averageRating?.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({metrics?.completedCollaborations} jobs)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {creator.bio && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{creator.bio}</p>}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {creator.followers !== undefined && creator.followers > 0 && (
                      <div className="flex items-center gap-1">
                        <Users size={13} className="text-blue-500" />
                        <span className="font-semibold">{creator.followers.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">followers</span>
                      </div>
                    )}
                    {(metrics?.engagementRate ?? 0) > 0 && (
                      <span className="text-xs text-green-600 font-medium">{metrics?.engagementRate}% eng.</span>
                    )}
                  </div>

                  {/* Niche tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {creator.niche?.slice(0, 3).map((n) => (
                      <span key={n} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full capitalize">{n}</span>
                    ))}
                    {creator.skills?.slice(0, 2).map((s) => (
                      <span key={s} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  {/* Location */}
                  {creator.location && (
                    <p className="text-xs text-gray-400 mt-2">📍 {creator.location}</p>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <Link to={`/creators/${u?._id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  );
};

export default CreatorsList;
