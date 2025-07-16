import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/index';
import { Megaphone, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education', 'Finance', 'Sports'];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'other'];

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    currency: 'ETB',
    duration: '',
    niche: [] as string[],
    requiredSkills: [] as string[],
    targetAudience: '',
    platform: [] as string[],
    requirements: '',
    minFollowers: '',
    location: '',
    tags: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const set = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleArr = (field: 'niche' | 'platform', val: string) => {
    setForm((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const addToArr = (field: 'requiredSkills' | 'tags', val: string, reset: () => void) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, [field]: [...new Set([...prev[field], trimmed])] }));
    reset();
  };

  const removeFromArr = (field: 'requiredSkills' | 'tags', val: string) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((v) => v !== val) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.budget || !form.duration) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.niche.length === 0) {
      toast.error('Select at least one niche');
      return;
    }
    setLoading(true);
    try {
      await campaignAPI.create({
        ...form,
        budget: parseFloat(form.budget),
        duration: parseInt(form.duration),
        minFollowers: form.minFollowers ? parseInt(form.minFollowers) : 0,
      });
      // Update coin balance locally
      if (user) setUser({ ...user, coinBalance: user.coinBalance - 10 });
      toast.success('Campaign posted! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Megaphone size={18} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post a Campaign</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">
          Costs <strong>10 coins</strong>. Balance: <strong>{user?.coinBalance}</strong> coins.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Basic Info</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Campaign Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. TikTok Product Review Campaign"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe your campaign, what you need, expected deliverables…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Budget & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Budget (ETB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="e.g. 5000"
                min={0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="e.g. 14"
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 border-b pb-2">Creator Requirements</h2>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niche <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleArr('niche', n.toLowerCase())}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    form.niche.includes(n.toLowerCase())
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleArr('platform', p)}
                  className={`px-3 py-1.5 rounded-full text-sm border capitalize transition ${
                    form.platform.includes(p)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Min followers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Followers</label>
              <input
                type="number"
                value={form.minFollowers}
                onChange={(e) => set('minFollowers', e.target.value)}
                placeholder="e.g. 10000"
                min={0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Addis Ababa"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToArr('requiredSkills', skillInput, () => setSkillInput('')); }}}
                placeholder="Type a skill and press Enter"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="button" onClick={() => addToArr('requiredSkills', skillInput, () => setSkillInput(''))}
                className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {s}
                  <button type="button" onClick={() => removeFromArr('requiredSkills', s)}>
                    <X size={12} className="hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
            <input
              value={form.targetAudience}
              onChange={(e) => set('targetAudience', e.target.value)}
              placeholder="e.g. Young adults 18-25 interested in tech"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Detailed Requirements</label>
            <textarea
              value={form.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              rows={3}
              placeholder="Any specific requirements, deliverable formats, content guidelines…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <><Spinner size={18} /> Posting…</> : '🚀 Post Campaign (–10 coins)'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
