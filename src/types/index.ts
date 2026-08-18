// ─── User & Auth ──────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'creator' | 'business' | 'admin' | 'superadmin';
  coinBalance: number;
  profileStatus: 'pending' | 'approved' | 'rejected';
  avatar: string;
  createdAt: string;
}

export interface IAuthResponse {
  success: boolean;
  token: string;
  user: IUser;
}

// ─── Profile ──────────────────────────────────────────────
export interface IProfile {
  _id: string;
  userId: IUser;
  bio: string;
  location: string;
  phone?: string;
  
  // Creator-specific
  niche?: string[];
  skills?: string[];
  followers?: number;
  platform?: string;
  socialLinks?: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  portfolio?: Array<{
    title: string;
    url: string;
    description: string;
    mediaType: string;
  }>;
  performanceMetrics?: {
    avgViews: number;
    avgLikes: number;
    engagementRate: number;
    completedCollaborations: number;
    averageRating: number;
    totalEarnings: number;
  };

  // Business-specific
  businessName?: string;
  industry?: string;
  companySize?: string;
  targetAudience?: string;
  website?: string;

  // Approval
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// ─── Campaign ─────────────────────────────────────────────
export interface ICampaign {
  _id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  duration: number;
  niche: string[];
  requiredSkills: string[];
  targetAudience: string;
  platform: string[];
  requirements: string;
  postedBy: IUser;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  applicationsCount: number;
  selectedCreator?: IUser;
  minFollowers?: number;
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Application ──────────────────────────────────────────
export interface IApplication {
  _id: string;
  campaignId: ICampaign;
  applicantId: IUser;
  businessId: IUser;
  message: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  collaborationStatus?: 'negotiating' | 'active' | 'completed' | 'disputed';
  aiScore?: number;
  chatId?: string;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────
export interface IChat {
  _id: string;
  participants: IUser[];
  applicationId: IApplication;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  chatId: string;
  senderId: IUser;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────
export interface INotification {
  _id: string;
  userId: string;
  senderId?: IUser;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  refId?: string;
  refModel?: string;
  createdAt: string;
}

// ─── Ratings ──────────────────────────────────────────────
export interface IRating {
  _id: string;
  fromUserId: IUser;
  toUserId: string;
  applicationId: string;
  score: number;
  communication: number;
  professionalism: number;
  timeliness: number;
  qualityOfWork: number;
  comment?: string;
  createdAt: string;
}

// ─── Coin Transaction ─────────────────────────────────────
export interface ICoinTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// ─── Pagination ───────────────────────────────────────────
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
