import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api/client';
import { Spinner } from '../../components/common/index';
import { User, Plus, X, Link as LinkIcon, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES    = ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Beauty', 'Education', 'Finance', 'Sports'];
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'other'];
const SIZES     = ['1-10', '11-50', '51-200', '201-500', '500+'];

const ProfileEditor: React.FC = () => {
  const { user, profile, setProfile, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [portfolioForm, setPortfolioForm] = useState({ title: '', url: '', description: '' });
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  const isCreator  = user?.role === 'creator';
  const isBusiness = user?.role === 'business';

  const [form, setForm] = useState({
    bio: '',
    location: '',
    phone: '',
    // Creator
    niche: [] as string[],
    skills: [] as string[],
    followers: '',
    platform: '',
    socialLinks: { youtube: '', tiktok: '', instagram: '', twitter: '', website: '' },
    portfolio: [] as Array<{ title: string; url: string; description: string; mediaType: string }>,
    // Business
    businessName: '',
    industry: '',
    companySize: '',
    targetAudience: '',
    website: '',
    // Shared
    avatar: '',
  });

  // Load existing profile into form
  useEffect(() => {
    if (!profile) return;
    setForm({
      bio:           profile.bio || '',
      location:      profile.location || '',
      phone:         profile.phone || '',
      niche:         profile.niche || [],
      skills:        profile.skills || [],
      followers:     profile.followers?.toString() || '',
      platform:      profile.platform || '',
      socialLinks: {
        youtube:   profile.socialLinks?.youtube   || '',
        tiktok:    profile.socialLinks?.tiktok    || '',
        instagram: profile.socialLinks?.instagram || '',
        twitter:   profile.socialLinks?.twitter   || '',
        website:   profile.socialLinks?.website   || '',
      },
      portfolio:     profile.portfolio || [],
      businessName:  profile.businessName  || '',
      industry:      profile.industry      || '',
      companySize:   profile.companySize   || '',
      targetAudience:profile.targetAudience || '',
      website:       profile.website        || '',
      avatar:        user?.avatar || '',
    });
  }, [profile, user]);

  const set = (field: string, val: any) => setForm((p) => ({ ...p, [field]: val }));
  const setSocial = (field: string, val: string) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [field]: val } }));

  const toggleNiche = (n: string) => {
    const lc = n.toLowerCase();
    setForm((p) => ({ ...p, niche: p.niche.includes(lc) ? p.niche.filter((x) => x !== lc) : [...p.niche, lc] }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setForm((p) => ({ ...p, skills: [...new Set([...p.skills, s])] }));
    setSkillInput('');
  };

  const removeSkill = (s: string) => setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  const addPortfolio = () => {
    if (!portfolioForm.title || !portfolioForm.url) { toast.error('Title and URL are required'); return; }
    setForm((p) => ({ ...p, portfolio: [...p.portfolio, { ...portfolioForm, mediaType: 'link' }] }));
    setPortfolioForm({ title: '', url: '', description: '' });
    setShowPortfolioForm(false);
  };

  const removePortfolio = (i: number) =>
    setForm((p) => ({ ...p, portfolio: p.portfolio.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        bio:      form.bio,
        location: form.location,
        phone:    form.phone,
        avatar:   form.avatar,
      };
      if (isCreator) {
        Object.assign(payload, {
          niche:       form.niche,
          skills:      form.skills,
          followers:   form.followers ? parseInt(form.followers) : 0,
          platform:    form.platform,
          socialLinks: form.socialLinks,
          portfolio:   form.portfolio,
        });
      }
      if (isBusiness) {
        Object.assign(payload, {
          businessName:   form.businessName,
          industry:       form.industry,
          companySize:    form.companySize,
          targetAudience: form.targetAudience,
          website:        form.website,
        });
      }
      const res = await profileAPI.updateMe(payload);
      setProfile(res.data.profile);
      if (form.avatar && user) setUser({ ...user, avatar: form.avatar });
      toast.success('Profile saved! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;

  const approvalBanner = {
    pending:  { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', msg: 'Your profile is under review. Admin will approve or reject it soon.' },
    approved: { bg: 'bg-green-50 border-green-200',  text: 'text-green-800',  msg: '✅ Your profile is approved and visible on the platform.' },
    rejected: { bg: 'bg-red-50 border-red-200',      text: 'text-red-800',    msg: `❌ Profile rejected: ${profile?.rejectionReason || 'Please update and resubmit.'}` },
  }[profile?.approvalStatus || 'pending'];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
          <User size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm capitalize">{user?.role} Account</p>
        </div>
      </div>

      {/* Approval banner */}
      {approvalBanner && (
        <div className={`border rounded-xl px-4 py-3 mb-6 text-sm ${approvalBanner.bg} ${approvalBanner.text}`}>
          {approvalBanner.msg}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input value={user?.name || ''} disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
            </Field>
            <Field label="Email">
              <input value={user?.email || ''} disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Addis Ababa, Ethiopia"
                className={input} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+251 9..."
                className={input} />
            </Field>
            <Field label="Avatar URL">
              <input value={form.avatar} onChange={(e) => set('avatar', e.target.value)} placeholder="https://..."
                className={input} />
            </Field>
          </div>
          <Field label="Bio">
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3}
              placeholder="Tell businesses/creators about yourself…"
              className={`${input} resize-none`} />
          </Field>
        </Section>

        {/* Creator-specific */}
        {isCreator && (
          <>
            <Section title="Creator Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Platform">
                  <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className={input}>
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </Field>
                <Field label="Followers">
                  <input type="number" value={form.followers} onChange={(e) => set('followers', e.target.value)} placeholder="e.g. 50000" min={0}
                    className={input} />
                </Field>
              </div>

              {/* Niche */}
              <Field label="Niche (select all that apply)">
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => (
                    <button key={n} type="button" onClick={() => toggleNiche(n)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${form.niche.includes(n.toLowerCase()) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Skills */}
              <Field label="Skills">
                <div className="flex gap-2 mb-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter"
                    className={`${input} flex-1`} />
                  <button type="button" onClick={addSkill} className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {s} <button type="button" onClick={() => removeSkill(s)}><X size={12} className="hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
              </Field>
            </Section>

            {/* Social Links */}
            <Section title="Social Links">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['youtube', 'tiktok', 'instagram', 'twitter', 'website'] as const).map((key) => (
                  <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input value={(form.socialLinks as any)[key]} onChange={(e) => setSocial(key, e.target.value)}
                        placeholder={`https://${key}.com/...`}
                        className={`${input} pl-8`} />
                    </div>
                  </Field>
                ))}
              </div>
            </Section>

            {/* Portfolio */}
            <Section title="Portfolio">
              {form.portfolio.length > 0 && (
                <div className="space-y-2 mb-4">
                  {form.portfolio.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                          {item.url}
                        </a>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                      </div>
                      <button onClick={() => removePortfolio(i)} className="text-gray-400 hover:text-red-500 ml-3">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showPortfolioForm ? (
                <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                  <Field label="Title"><input value={portfolioForm.title} onChange={(e) => setPortfolioForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Brand Review Video" className={input} /></Field>
                  <Field label="URL"><input value={portfolioForm.url} onChange={(e) => setPortfolioForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." className={input} /></Field>
                  <Field label="Description (optional)"><input value={portfolioForm.description} onChange={(e) => setPortfolioForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description" className={input} /></Field>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPortfolioForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={addPortfolio} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add Item</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowPortfolioForm(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 border border-dashed border-blue-300 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition w-full justify-center">
                  <Plus size={15} /> Add Portfolio Item
                </button>
              )}
            </Section>
          </>
        )}

        {/* Business-specific */}
        {isBusiness && (
          <Section title="Business Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business Name" className="sm:col-span-2">
                <input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="e.g. Acme Corp" className={input} />
              </Field>
              <Field label="Industry">
                <input value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. E-commerce" className={input} />
              </Field>
              <Field label="Company Size">
                <select value={form.companySize} onChange={(e) => set('companySize', e.target.value)} className={input}>
                  <option value="">Select size</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </Field>
              <Field label="Website" className="sm:col-span-2">
                <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourcompany.com" className={input} />
              </Field>
              <Field label="Target Audience" className="sm:col-span-2">
                <input value={form.targetAudience} onChange={(e) => set('targetAudience', e.target.value)} placeholder="e.g. Young adults 18-30 in East Africa" className={input} />
              </Field>
            </div>
          </Section>
        )}
      </div>

      {/* Save button */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Changes reset profile to <strong>pending</strong> review if key fields are changed.
        </p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
          {saving ? <><Spinner size={16} /> Saving…</> : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────
const input = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <h2 className="font-semibold text-gray-800 border-b pb-2 text-sm uppercase tracking-wide text-gray-500">{title}</h2>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export default ProfileEditor;
