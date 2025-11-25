import axios from 'axios';
import { Response } from 'express';
import Profile from '../models/Profile.model';
import Campaign from '../models/Campaign.model';
import Application from '../models/Application.model';
import Rating from '../models/Rating.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ─── Call Gemini API ──────────────────────────────────────
const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ─── POST /api/ai/recommend ───────────────────────────────
// Business owner gets AI-ranked creator recommendations for a campaign
export const getCreatorRecommendations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { campaignId } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found.' });
      return;
    }

    // Get all approved creator profiles
    const profiles = await Profile.find({ approvalStatus: 'approved' })
      .populate('userId', 'name email avatar')
      .limit(20);

    if (profiles.length === 0) {
      res.status(200).json({ success: true, recommendations: [], message: 'No creators found.' });
      return;
    }

    // Build profile summaries for AI
    const creatorSummaries = profiles.map((p, i) => ({
      index: i,
      name: (p.userId as any).name,
      niche: p.niche?.join(', ') || 'general',
      skills: p.skills?.join(', ') || '',
      followers: p.followers || 0,
      platform: p.platform || 'unknown',
      avgViews: p.performanceMetrics?.avgViews || 0,
      engagementRate: p.performanceMetrics?.engagementRate || 0,
      rating: p.performanceMetrics?.averageRating || 0,
      completedJobs: p.performanceMetrics?.completedCollaborations || 0,
      location: p.location || 'not specified',
    }));

    const prompt = `
You are an AI assistant for an advertising collaboration platform.

Campaign Details:
- Title: "${campaign.title}"
- Niche: ${campaign.niche.join(', ')}
- Budget: ${campaign.budget} ETB
- Duration: ${campaign.duration} days
- Target Audience: ${campaign.targetAudience || 'general'}
- Required Platform: ${campaign.platform.join(', ') || 'any'}
- Requirements: ${campaign.requirements || 'none specified'}

Available Creators (JSON):
${JSON.stringify(creatorSummaries, null, 2)}

Task: Rank ALL creators from most to least suitable for this campaign.
For each creator, provide:
1. A match score (0-100)
2. A brief reason (1-2 sentences)
3. Predicted engagement level: low/medium/high
4. Estimated ROI rating: poor/fair/good/excellent

Return ONLY a JSON array like this (no markdown, no explanation):
[
  {
    "index": 0,
    "matchScore": 85,
    "reason": "Strong niche alignment with high engagement rate.",
    "predictedEngagement": "high",
    "estimatedROI": "excellent"
  }
]
`;

    let recommendations: any[] = [];

    try {
      const aiResponse = await callGemini(prompt);
      // Strip markdown code blocks if present
      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      recommendations = parsed.map((item: any) => {
        const profile = profiles[item.index];
        return {
          profile: {
            _id: profile._id,
            userId: profile.userId,
            niche: profile.niche,
            skills: profile.skills,
            followers: profile.followers,
            platform: profile.platform,
            performanceMetrics: profile.performanceMetrics,
            location: profile.location,
          },
          matchScore: item.matchScore,
          reason: item.reason,
          predictedEngagement: item.predictedEngagement,
          estimatedROI: item.estimatedROI,
        };
      });

      recommendations.sort((a, b) => b.matchScore - a.matchScore);
    } catch (err) {
      console.error('AI parsing error:', err);
      // Fallback: basic niche-based matching without AI
      recommendations = profiles
        .map((p) => {
          const nicheMatch = p.niche?.some((n) =>
            campaign.niche.map((cn) => cn.toLowerCase()).includes(n.toLowerCase())
          );
          return {
            profile: {
              _id: p._id,
              userId: p.userId,
              niche: p.niche,
              skills: p.skills,
              followers: p.followers,
              platform: p.platform,
              performanceMetrics: p.performanceMetrics,
            },
            matchScore: nicheMatch ? 75 : 40,
            reason: nicheMatch
              ? 'Niche aligns with campaign requirements.'
              : 'General creator — may still be suitable.',
            predictedEngagement: 'medium',
            estimatedROI: 'fair',
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
    }

    res.status(200).json({ success: true, recommendations });
  }
);

// ─── POST /api/ai/analyze/:creatorId ─────────────────────
// Analyze a creator's performance and predict future metrics
export const analyzeCreator = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await Profile.findOne({ userId: req.params.creatorId })
    .populate('userId', 'name createdAt');

  if (!profile) {
    res.status(404).json({ success: false, message: 'Creator not found.' });
    return;
  }

  const ratings = await Rating.find({ toUserId: req.params.creatorId });
  const completedApps = await Application.countDocuments({
    applicantId: req.params.creatorId,
    collaborationStatus: 'completed',
  });

  const prompt = `
You are a marketing analytics AI for an advertising platform.

Creator Profile:
- Name: ${(profile.userId as any).name}
- Platform: ${profile.platform || 'unknown'}
- Niche: ${profile.niche?.join(', ') || 'general'}
- Followers: ${profile.followers?.toLocaleString() || 0}
- Average Views: ${profile.performanceMetrics?.avgViews?.toLocaleString() || 0}
- Engagement Rate: ${profile.performanceMetrics?.engagementRate || 0}%
- Average Rating: ${profile.performanceMetrics?.averageRating || 0}/5 (from ${ratings.length} ratings)
- Completed Collaborations: ${completedApps}
- Member since: ${(profile.userId as any).createdAt}

Provide a comprehensive creator analysis. Return ONLY a JSON object (no markdown):
{
  "overallScore": 82,
  "trustScore": 78,
  "growthTrend": "upward",
  "audienceDemographics": "Young adults 18-24, primarily urban",
  "contentStrengths": ["engaging storytelling", "consistent posting"],
  "predictedEngagementRange": "8-12%",
  "recommendedBudgetRange": "5000-15000 ETB",
  "bestFitIndustries": ["tech", "lifestyle"],
  "riskLevel": "low",
  "summary": "Strong creator with consistent growth...",
  "recommendations": ["Consider longer campaign partnerships", "Best for product reviews"]
}
`;

  let analysis: any = null;

  try {
    const aiResponse = await callGemini(prompt);
    const cleaned = aiResponse.replace(/```json|```/g, '').trim();
    analysis = JSON.parse(cleaned);
  } catch (err) {
    // Fallback analysis based on raw data
    analysis = {
      overallScore: Math.min(100, (profile.performanceMetrics?.averageRating || 3) * 20),
      trustScore: Math.min(100, completedApps * 10 + (ratings.length * 5)),
      growthTrend: 'stable',
      audienceDemographics: 'Data not available',
      contentStrengths: profile.skills || [],
      predictedEngagementRange: `${profile.performanceMetrics?.engagementRate || 0}%`,
      recommendedBudgetRange: 'Contact creator for pricing',
      bestFitIndustries: profile.niche || [],
      riskLevel: completedApps > 5 ? 'low' : 'medium',
      summary: `Creator with ${profile.followers?.toLocaleString() || 0} followers on ${profile.platform || 'social media'}.`,
      recommendations: ['Review portfolio before hiring'],
    };
  }

  res.status(200).json({ success: true, creator: profile, analysis });
});
