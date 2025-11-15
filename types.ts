
export enum Role {
  Employee = 'Employee',
  Admin = 'Admin',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
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
}

export interface Feedback {
  id: number;
  requestId: number;
  reviewer: User | null; // null if anonymous
  strengths: string;
  growthOpportunities: string;
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
  | { type: 'dashboard' }
  | { type: 'request-feedback' }
  | { type: 'give-feedback'; request: FeedbackRequest }
  | { type: 'view-summary'; userId: number; quarter: string };
