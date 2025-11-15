
import { Role, User, FeedbackRequest, FeedbackStatus, Feedback } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Alex Johnson', email: 'alex@acme.inc', role: Role.Admin, department: 'Leadership', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Brenda Smith', email: 'brenda@acme.inc', role: Role.Employee, department: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Charles Davis', email: 'charles@acme.inc', role: Role.Employee, department: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Diana Miller', email: 'diana@acme.inc', role: Role.Employee, department: 'Product', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'Ethan Wilson', email: 'ethan@acme.inc', role: Role.Employee, department: 'Design', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, name: 'Fiona Garcia', email: 'fiona@acme.inc', role: Role.Employee, department: 'Marketing', avatar: 'https://i.pravatar.cc/150?u=6' },
];

export const FEEDBACK_REQUESTS: FeedbackRequest[] = [
  { id: 1, requester: USERS[1], reviewee: USERS[2], status: FeedbackStatus.Pending, isAnonymous: true, context: 'Feedback on the Q3 project leadership.', createdAt: '2024-09-05', quarter: 'Q3 2024' },
  { id: 2, requester: USERS[3], reviewee: USERS[1], status: FeedbackStatus.Completed, isAnonymous: false, context: 'General feedback on collaboration.', createdAt: '2024-09-02', quarter: 'Q3 2024' },
  { id: 3, requester: USERS[4], reviewee: USERS[1], status: FeedbackStatus.Pending, isAnonymous: false, context: 'Feedback on my presentation skills.', createdAt: '2024-09-10', quarter: 'Q3 2024' },
  { id: 4, requester: USERS[1], reviewee: USERS[4], status: FeedbackStatus.Pending, isAnonymous: true, context: 'How can I improve my design handoffs?', createdAt: '2024-09-11', quarter: 'Q3 2024' },
];

export const FEEDBACK_DATA: Feedback[] = [
  { id: 1, requestId: 2, reviewer: USERS[3], strengths: 'Brenda is an exceptional collaborator. Her SBI (Situation-Behavior-Impact) was clear during the project planning; she actively listened to all stakeholders, which resulted in a more inclusive roadmap.', growthOpportunities: 'Sometimes, in the rush to deliver, smaller details can be overlooked. Taking an extra day for QA could be beneficial.', vibeRating: 5, vibeComment: 'Always a pleasure to work with Brenda!', submittedAt: '2024-09-04' },
];
