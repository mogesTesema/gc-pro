// ─── User Roles ─────────────────────────────────────────
export const ROLES = {
  CREATOR: 'creator',
  BUSINESS: 'business',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Profile Approval Status ────────────────────────────
export const PROFILE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// ─── Campaign Status ─────────────────────────────────────
export const CAMPAIGN_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
} as const;

// ─── Application Status ──────────────────────────────────
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

// ─── Collaboration Status ────────────────────────────────
export const COLLABORATION_STATUS = {
  NEGOTIATING: 'negotiating',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
} as const;

// ─── Coin Transaction Types ──────────────────────────────
export const COIN_TX_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

// ─── Notification Types ──────────────────────────────────
export const NOTIFICATION_TYPES = {
  PROFILE_APPROVED: 'profile_approved',
  PROFILE_REJECTED: 'profile_rejected',
  NEW_APPLICATION: 'new_application',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  NEW_MESSAGE: 'new_message',
  COLLABORATION_STARTED: 'collaboration_started',
  WORK_COMPLETED: 'work_completed',
  RATING_RECEIVED: 'rating_received',
  COINS_ADDED: 'coins_added',
  CAMPAIGN_MATCH: 'campaign_match',
} as const;

// ─── Coin Costs ──────────────────────────────────────────
export const COIN_COSTS = {
  POST_CAMPAIGN: Number(process.env.COINS_TO_POST_CAMPAIGN) || 10,
  APPLY_CAMPAIGN: Number(process.env.COINS_TO_APPLY) || 5,
};

// ─── Pagination Defaults ─────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};
