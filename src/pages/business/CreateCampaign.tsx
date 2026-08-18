import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/index';
import { Megaphone, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education', 'Finance', 'Sports'];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'other'];
const STEPS = ['Basics', 'Targeting', 'Requirements'] as const;

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    titleRef.current?.focus();
  }, [step]);

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

  const missingBasics = !form.title || !form.description || !form.budget || !form.duration;
  const missingNiche = form.niche.length === 0;

  const goNext = () => {
    if (step === 1 && missingBasics) {
      setStepError('Complete the required basics before continuing.');
      return;
    }
    if (step === 2 && missingNiche) {
      setStepError('Pick at least one niche.');
      return;
    }
    setStepError('');
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setStepError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    if (missingBasics) {
      setStepError('Complete the required basics before posting.');
      setStep(1);
      return;
    }
    if (missingNiche) {
      setStepError('Pick at least one niche.');
      setStep(2);
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
      if (user) setUser({ ...user, coinBalance: user.coinBalance - 10 });
      toast.success('Campaign posted! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const pane = (n: number) =>
    n === step
      ? 'space-y-5'
      : 'h-0 overflow-hidden opacity-0';

  const errorBorder = (empty: boolean) =>
    stepError && empty ? 'border-red-500' : 'border-gray-300';

  return (
    <div className="p-6 max-w-2xl mx-auto">
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

      <div className="flex gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium border ${
            step === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'
          }`}>
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {stepError && (
        <p className="text-sm text-red-600 mb-4 font-medium">{stepError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`bg-white rounded-xl border border-gray-200 p-6 ${pane(1)}`} aria-hidden={step !== 1}>
          <h2 className="font-semibold text-gray-800 border-b pb-2">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Campaign Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. TikTok Product Review Campaign"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errorBorder(!form.title)}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe your campaign, what you need, expected deliverables…"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${errorBorder(!form.description)}`}
            />
          </div>

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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errorBorder(!form.budget)}`}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errorBorder(!form.duration)}`}
              />
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl border border-gray-200 p-6 ${pane(2)}`} aria-hidden={step !== 2}>
          <h2 className="font-semibold text-gray-800 border-b pb-2">Creator Requirements</h2>

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
                      : missingNiche && stepError
                        ? 'border-red-400 text-gray-600'
                        : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

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
        </div>

        <div className={`bg-white rounded-xl border border-gray-200 p-6 ${pane(3)}`} aria-hidden={step !== 3}>
          <h2 className="font-semibold text-gray-800 border-b pb-2">Deliverables</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToArr('tags', tagInput, () => setTagInput('')); }}}
                placeholder="Type a tag and press Enter"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="button" onClick={() => addToArr('tags', tagInput, () => setTagInput(''))}
                className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {s}
                  <button type="button" onClick={() => removeFromArr('tags', s)}>
                    <X size={12} className="hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
            <input
              value={form.targetAudience}
              onChange={(e) => set('targetAudience', e.target.value)}
              placeholder="e.g. Young adults 18-25 interested in tech"
              className="w-full px-4 py-2.5 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

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

        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              ref={nextRef}
              type="button"
              onClick={goNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <><Spinner size={18} /> Posting…</> : 'Post Campaign (–10 coins)'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
