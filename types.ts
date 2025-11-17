export enum Role {
  Employee = 'Employee',
  Admin = 'Admin',
}

export interface UserProfile {
  bio: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface UserPreferences {
  receive: string[];
  give: string[];
}

export interface NotificationSettings {
    newRequestEmail: boolean;
    feedbackSubmittedEmail: boolean;
    weeklySummaryEmail: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  managerId: number | null;
  profile: UserProfile;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
}

export enum FeedbackStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Declined = 'Declined',
}

export interface FeedbackRequest {
  id: number;
  requester: User;
  reviewee: User;
  status: FeedbackStatus;
  isAnonymous: boolean;
  context: string;
  createdAt: string;
  quarter: string;
  type: 'Requested' | 'Suggested' | 'Mandated';
}

export interface SBI {
  situation: string;
  behavior: string;
  impact: string;
}

export interface Feedback {
  id: number;
  requestId: number;
  reviewer: User | null; // null if anonymous
  strengths: SBI;
  growthOpportunities: SBI;
  vibeRating: number;
  vibeComment: string;
  submittedAt: string;
}

export interface Summary {
  userId: number;
  quarter: string;
  strengthsSummary: string;
  growthSummary: string;
  keyThemes: string[];
  sentiment: { positive: number; neutral: number; negative: number };
  vibeTrend: { quarter: string; score: number }[];
}

export type View = 
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'dashboard' }
  | { type: 'request-feedback' }
  | { type: 'give-feedback'; request: FeedbackRequest }
  | { type: 'view-summary'; userId: number; quarter: string }
  | { type: 'settings' };