import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI, ratingsAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { IApplication } from '../../types';
import { Badge, PageLoading, EmptyState, Modal, Spinner } from '../../components/common/index';
import { FileText, MessageSquare, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const RATING_FIELDS = ['communication', 'professionalism', 'timeliness', 'qualityOfWork'] as const;

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeLoading, setCompleteLoading] = useState<string | null>(null);

  // Rating modal
  const [rateModal, setRateModal] = useState<{ open: boolean; app: IApplication | null }>({ open: false, app: null });
  const [rating, setRating] = useState({ score: 5, communication: 5, professionalism: 5, timeliness: 5, qualityOfWork: 5, comment: '' });
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await applicationAPI.getMy();
        setApplications(res.data.applications || []);
      } catch {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMarkComplete = async (appId: string) => {
    setCompleteLoading(appId);
    try {
      const res = await applicationAPI.markComplete(appId);
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId
            ? { ...a, creatorMarkedComplete: true, collaborationStatus: res.data.bothCompleted ? 'completed' : a.collaborationStatus } as any
            : a
        )
      );
      if (res.data.bothCompleted) {
        toast.success('Collaboration complete! Please rate the business. 🎉');
      } else {
        toast.success('Marked as complete. Waiting for business confirmation.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark complete');
    } finally {
      setCompleteLoading(null);
    }
  };

  const handleSubmitRating = async () => {
    if (!rateModal.app) return;
    setRatingLoading(true);
    try {
      await ratingsAPI.submit({ applicationId: rateModal.app._id, ...rating });
      toast.success('Rating submitted! Thank you ⭐');
      setRateModal({ open: false, app: null });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const StarRating: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 w-36">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)}
            className={`text-xl transition ${s <= value ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-400`}>
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) return <PageLoading />;

  const grouped = {
    active:    applications.filter((a) => a.status === 'accepted' && a.collaborationStatus !== 'completed'),
    pending:   applications.filter((a) => a.status === 'pending'),
    completed: applications.filter((a) => a.collaborationStatus as string === 'completed'),
    rejected:  applications.filter((a) => a.status === 'rejected'),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">{applications.length} total applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">📋</span>}
          title="No applications yet"
          description="Browse campaigns and apply to get started"
          action={
            <Link to="/campaigns" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 inline-block">
              Browse Campaigns
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Active collaborations */}
          {grouped.active.length > 0 && (
            <Group title="🤝 Active Collaborations" count={grouped.active.length}>
              {grouped.active.map((app) => (
                <AppCard key={app._id} app={app}>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {app.chatId && (
                      <Link to={`/chat/${app.chatId}`}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        <MessageSquare size={12} /> Open Chat
                      </Link>
                    )}
                    {!(app as any).creatorMarkedComplete && (
                      <button
                        onClick={() => handleMarkComplete(app._id)}
                        disabled={completeLoading === app._id}
                        className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        {completeLoading === app._id ? <Spinner size={12} /> : <CheckCircle size={12} />}
                        Mark Complete
                      </button>
                    )}
                    {(app as any).creatorMarkedComplete && (
                      <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                        ✅ You marked complete — awaiting business
                      </span>
                    )}
                  </div>
                </AppCard>
              ))}
            </Group>
          )}

          {/* Pending */}
          {grouped.pending.length > 0 && (
            <Group title="⏳ Pending Review" count={grouped.pending.length}>
              {grouped.pending.map((app) => (
                <AppCard key={app._id} app={app} />
              ))}
            </Group>
          )}

          {/* Completed */}
          {grouped.completed.length > 0 && (
            <Group title="✅ Completed" count={grouped.completed.length}>
              {grouped.completed.map((app) => (
                <AppCard key={app._id} app={app}>
                  <button
                    onClick={() => setRateModal({ open: true, app })}
                    className="mt-3 flex items-center gap-1.5 text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition"
                  >
                    <Star size={12} /> Rate Business Owner
                  </button>
                </AppCard>
              ))}
            </Group>
          )}

          {/* Rejected */}
          {grouped.rejected.length > 0 && (
            <Group title="❌ Not Selected" count={grouped.rejected.length}>
              {grouped.rejected.map((app) => (
                <AppCard key={app._id} app={app} />
              ))}
            </Group>
          )}
        </div>
      )}

      {/* Rating Modal */}
      <Modal isOpen={rateModal.open} onClose={() => setRateModal({ open: false, app: null })} title="Rate the Business Owner" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            How was your collaboration with <strong>{(rateModal.app?.businessId as any)?.name || 'the business'}</strong>?
          </p>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <StarRating label="Overall" value={rating.score} onChange={(v) => setRating((r) => ({ ...r, score: v }))} />
            <StarRating label="Communication" value={rating.communication} onChange={(v) => setRating((r) => ({ ...r, communication: v }))} />
            <StarRating label="Professionalism" value={rating.professionalism} onChange={(v) => setRating((r) => ({ ...r, professionalism: v }))} />
            <StarRating label="Timeliness" value={rating.timeliness} onChange={(v) => setRating((r) => ({ ...r, timeliness: v }))} />
            <StarRating label="Quality of Work" value={rating.qualityOfWork} onChange={(v) => setRating((r) => ({ ...r, qualityOfWork: v }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea value={rating.comment} onChange={(e) => setRating((r) => ({ ...r, comment: e.target.value }))}
              rows={3} placeholder="Share your experience…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setRateModal({ open: false, app: null })}
              className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSubmitRating} disabled={ratingLoading}
              className="flex-1 bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {ratingLoading ? <Spinner size={15} /> : '⭐'} Submit Rating
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────
const Group: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => (
  <div>
    <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
      {title}
      <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
    </h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const AppCard: React.FC<{ app: IApplication; children?: React.ReactNode }> = ({ app, children }) => {
  const campaign = app.campaignId as any;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link to={`/campaigns/${campaign?._id}`}
              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline">
              {campaign?.title || 'Campaign'}
            </Link>
            <Badge status={app.status} />
            {app.collaborationStatus && (app.collaborationStatus as string) !== (app.status as string) && (
              <Badge status={app.collaborationStatus} />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{app.message}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
            {app.proposedRate && <span>Rate: {app.proposedRate.toLocaleString()} ETB</span>}
            {campaign?.budget && <span>Budget: {campaign.budget.toLocaleString()} ETB</span>}
          </div>
        </div>
        {app.aiScore && (
          <div className="text-center shrink-0">
            <div className={`text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center ${
              app.aiScore >= 70 ? 'bg-green-100 text-green-700' :
              app.aiScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-600'
            }`}>
              {app.aiScore}
            </div>
            <p className="text-xs text-gray-400 mt-1">AI Score</p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default MyApplications;
