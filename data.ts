import { Role, User, FeedbackRequest, FeedbackStatus, Feedback } from './types';

export const USERS: User[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@acme.com',
    role: Role.Admin,
    department: 'Leadership',
    avatar: 'https://i.pravatar.cc/150?u=1',
    managerId: null,
    profile: {
      bio: 'Visionary leader driving innovation at Acme Inc.',
      linkedin: 'https://linkedin.com/in/alexjohnson',
      github: '',
      website: 'https://acme.com',
    },
    preferences: {
      receive: ['Strategic Planning', 'Team Motivation'],
      give: ['Leadership', 'Public Speaking'],
    },
    notificationSettings: {
        newRequestEmail: true,
        feedbackSubmittedEmail: true,
        weeklySummaryEmail: true,
    }
  },
  {
    id: 2,
    name: 'Brenda Smith',
    email: 'brenda.smith@acme.com',
    role: Role.Employee,
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=2',
    managerId: 1,
    profile: {
      bio: 'Senior Software Engineer specializing in backend systems.',
      linkedin: 'https://linkedin.com/in/brendasmith',
      github: 'https://github.com/brendasmith',
      website: '',
    },
    preferences: {
      receive: ['Code Quality', 'System Design'],
      give: ['Mentorship', 'Java'],
    },
    notificationSettings: {
        newRequestEmail: true,
        feedbackSubmittedEmail: true,
        weeklySummaryEmail: false,
    }
  },
  {
    id: 3,
    name: 'Charles Davis',
    email: 'charles.davis@acme.com',
    role: Role.Employee,
    department: 'Product',
    avatar: 'https://i.pravatar.cc/150?u=3',
    managerId: 1,
    profile: {
      bio: 'Product Manager focused on user-centric design.',
      linkedin: 'https://linkedin.com/in/charlesdavis',
      github: '',
      website: '',
    },
    preferences: {
      receive: ['Roadmap Prioritization', 'User Research'],
      give: ['Product Strategy', 'Agile Methodologies'],
    },
    notificationSettings: {
        newRequestEmail: true,
        feedbackSubmittedEmail: false,
        weeklySummaryEmail: false,
    }
  },
  {
    id: 4,
    name: 'Diana Miller',
    email: 'diana.miller@acme.com',
    role: Role.Employee,
    department: 'Design',
    avatar: 'https://i.pravatar.cc/150?u=4',
    managerId: 1,
    profile: {
      bio: 'Lead UX/UI Designer creating intuitive experiences.',
      linkedin: 'https://linkedin.com/in/dianamiller',
      github: '',
      website: 'https://dianamiller.design',
    },
    preferences: {
      receive: ['Visual Design', 'Interaction Design'],
      give: ['Figma', 'User Testing'],
    },
    notificationSettings: {
        newRequestEmail: true,
        feedbackSubmittedEmail: true,
        weeklySummaryEmail: false,
    }
  },
   {
    id: 5,
    name: 'Ethan Wilson',
    email: 'ethan.wilson@acme.com',
    role: Role.Employee,
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=5',
    managerId: 2,
    profile: {
      bio: 'Frontend developer passionate about React and performance.',
      linkedin: 'https://linkedin.com/in/ethanwilson',
      github: 'https://github.com/ethanwilson',
      website: '',
    },
    preferences: {
      receive: ['JavaScript', 'CSS architecture'],
      give: ['React', 'Web Performance'],
    },
    notificationSettings: {
        newRequestEmail: true,
        feedbackSubmittedEmail: true,
        weeklySummaryEmail: false,
    }
  },
];


export const FEEDBACK_REQUESTS: FeedbackRequest[] = [
    { id: 1, requester: USERS[2], reviewee: USERS[1], status: FeedbackStatus.Pending, isAnonymous: false, context: 'Feedback on the Q4 product spec for Project Phoenix.', createdAt: '2024-10-05', quarter: 'Q4 2024', type: 'Requested' },
    { id: 2, requester: USERS[3], reviewee: USERS[4], status: FeedbackStatus.Pending, isAnonymous: true, context: 'How can I improve my design handoffs to engineering?', createdAt: '2024-10-11', quarter: 'Q4 2024', type: 'Suggested' },
    { id: 3, requester: USERS[0], reviewee: USERS[1], status: FeedbackStatus.Completed, isAnonymous: false, context: 'General feedback on leadership during the last quarter.', createdAt: '2024-10-02', quarter: 'Q4 2024', type: 'Suggested' },
    { id: 4, requester: USERS[2], reviewee: USERS[0], status: FeedbackStatus.Completed, isAnonymous: false, context: 'Feedback on my contributions to the marketing campaign.', createdAt: '2024-07-15', quarter: 'Q3 2024', type: 'Requested' },
    { id: 5, requester: USERS[1], reviewee: USERS[2], status: FeedbackStatus.Pending, isAnonymous: true, context: 'Feedback on the Q4 project leadership for Project Phoenix.', createdAt: '2024-10-05', quarter: 'Q4 2024', type: 'Requested' },
    { id: 6, requester: USERS[4], reviewee: USERS[3], status: FeedbackStatus.Pending, isAnonymous: false, context: 'Would love your thoughts on my sales pitch.', createdAt: '2024-10-12', quarter: 'Q4 2024', type: 'Suggested' },
];

export const FEEDBACK_DATA: Feedback[] = [
    { 
        id: 1, 
        requestId: 3, 
        reviewer: USERS[1], 
        strengths: {
            situation: 'During the Q4 planning',
            behavior: 'Alex has a great strategic mind. He proposed a novel A/B testing strategy',
            impact: 'that ultimately increased our lead conversion by 15%.'
        }, 
        growthOpportunities: {
            situation: 'When preparing documentation for new strategies',
            behavior: 'the initial documentation was a bit sparse.',
            impact: 'Providing a more detailed brief earlier on could help the team execute even faster.'
        }, 
        vibeRating: 4, 
        vibeComment: 'Great working with Alex, very insightful.', 
        submittedAt: '2024-10-04' 
    },
    { 
        id: 2, 
        requestId: 4, 
        reviewer: USERS[0], 
        strengths: {
            situation: 'During the project planning for the recent campaign',
            behavior: 'Charles is an exceptional collaborator. His roadmap was clear and he actively listened to all stakeholders',
            impact: 'which resulted in a more inclusive vision and smoother execution.'
        }, 
        growthOpportunities: {
            situation: 'In the final stages of a project, when deadlines are tight',
            behavior: 'smaller details in tickets can sometimes be overlooked in the rush to deliver.',
            impact: 'Taking an extra day for QA on tickets could be beneficial to catch these before launch.'
        }, 
        vibeRating: 5, 
        vibeComment: 'Always a pleasure to work with Charles!', 
        submittedAt: '2024-07-20' 
    },
];