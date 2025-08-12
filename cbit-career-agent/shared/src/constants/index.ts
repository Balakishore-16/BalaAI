// Application Constants
export const APP_NAME = 'CBIT Personal AI Career Agent';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered career assistance for CBIT students';

// CBIT Specific Constants
export const CBIT_ROLL_NUMBER_PREFIX = '1601';
export const CBIT_DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology'
] as const;

export const CBIT_YEARS = [1, 2, 3, 4] as const;

// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_VERSION = 'v1';
export const API_TIMEOUT = 30000;

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// Search Constants
export const MAX_SAVED_SEARCHES = 10;
export const SEARCH_HISTORY_LIMIT = 50;
export const MAX_KEYWORDS = 10;
export const MAX_LOCATIONS = 5;

// Job Constants
export const JOB_EXPIRY_DAYS = 30;
export const MAX_SALARY = 1000000;
export const MIN_SALARY = 10000;

// Authentication Constants
export const JWT_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Notification Constants
export const MAX_NOTIFICATIONS = 100;
export const NOTIFICATION_RETENTION_DAYS = 90;
export const TELEGRAM_MESSAGE_LIMIT = 4096;
export const SMS_MESSAGE_LIMIT = 160;

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

// AI Constants
export const OPENAI_MAX_TOKENS = 4000;
export const OPENAI_TEMPERATURE = 0.7;
export const AI_RESPONSE_TIMEOUT = 30000;
export const MAX_CHAT_HISTORY = 50;

// Voice Constants
export const VOICE_RECOGNITION_TIMEOUT = 10000;
export const VOICE_SYNTHESIS_RATE = 1.0;
export const VOICE_SYNTHESIS_PITCH = 1.0;

// Cron Job Constants
export const JOB_SEARCH_FREQUENCY = '0 * * * *'; // Every hour
export const REMINDER_CHECK_FREQUENCY = '0 9 * * *'; // Daily at 9 AM
export const NOTIFICATION_CLEANUP_FREQUENCY = '0 2 * * 0'; // Weekly on Sunday at 2 AM

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_ROLL_NUMBER: 'Roll number must start with 1601',
  INVALID_DEPARTMENT: 'Invalid department selected',
  INVALID_YEAR: 'Invalid year selected',
  USER_ALREADY_EXISTS: 'User with this roll number or email already exists',
  INVALID_CREDENTIALS: 'Invalid roll number or password',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_TOKEN: 'Invalid or expired token',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',
  NOTIFICATION_ERROR: 'Failed to send notification',
  DATABASE_ERROR: 'Database operation failed'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SEARCH_SAVED: 'Search saved successfully',
  JOB_SAVED: 'Job saved successfully',
  REMINDER_CREATED: 'Reminder created successfully',
  REMINDER_UPDATED: 'Reminder updated successfully',
  REMINDER_DELETED: 'Reminder deleted successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
  RESUME_GENERATED: 'Resume generated successfully',
  COVER_LETTER_GENERATED: 'Cover letter generated successfully'
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  ROLL_NUMBER: {
    PATTERN: /^1601\d{6}$/,
    MESSAGE: 'Roll number must be 10 digits starting with 1601'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PHONE: {
    PATTERN: /^[6-9]\d{9}$/,
    MESSAGE: 'Please enter a valid 10-digit phone number'
  },
  PASSWORD: {
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    MESSAGE: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
  }
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  LOADING_TIMEOUT: 10000,
  ANIMATION_DURATION: 300,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TAG_LENGTH: 20,
  MAX_TAGS: 10
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  VOICE_ASSISTANT: true,
  AI_RESUME_GENERATOR: true,
  TELEGRAM_NOTIFICATIONS: true,
  TWILIO_NOTIFICATIONS: true,
  EMAIL_NOTIFICATIONS: true,
  AUTO_APPLY: false,
  ADVANCED_ANALYTICS: false,
  TEAM_COLLABORATION: false
} as const;

// External Service URLs
export const EXTERNAL_SERVICES = {
  LINKEDIN: 'https://www.linkedin.com',
  INDEED: 'https://www.indeed.com',
  GLASSDOOR: 'https://www.glassdoor.com',
  GITHUB: 'https://github.com',
  STACK_OVERFLOW: 'https://stackoverflow.com',
  HACKER_RANK: 'https://www.hackerrank.com',
  LEETCODE: 'https://leetcode.com'
} as const;

// Default Values
export const DEFAULT_VALUES = {
  USER: {
    notificationPreferences: {
      email: true,
      telegram: false,
      sms: false,
      whatsapp: false,
      jobAlerts: true,
      deadlineReminders: true,
      interviewReminders: true
    },
    savedSearches: [],
    savedJobs: [],
    reminders: []
  },
  JOB_FILTERS: {
    keywords: [],
    location: [],
    type: [],
    category: [],
    experienceLevel: [],
    isRemote: false,
    salaryMin: undefined,
    salaryMax: undefined,
    skills: [],
    companies: []
  },
  SEARCH_SCHEDULE: {
    frequency: 'daily' as const,
    time: '09:00',
    days: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true
  }
} as const;