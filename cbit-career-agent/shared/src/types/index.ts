// User and Authentication Types
export interface User {
  _id: string;
  rollNumber: string;
  name: string;
  email: string;
  password: string;
  department: string;
  year: number;
  phone?: string;
  telegramUsername?: string;
  notificationPreferences: NotificationPreferences;
  savedSearches: SavedSearch[];
  savedJobs: string[];
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  _id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: number;
  phone?: string;
  telegramUsername?: string;
  bio?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  resume?: string;
  coverLetter?: string;
}

export interface NotificationPreferences {
  email: boolean;
  telegram: boolean;
  sms: boolean;
  whatsapp: boolean;
  jobAlerts: boolean;
  deadlineReminders: boolean;
  interviewReminders: boolean;
}

// Job and Search Types
export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  category: JobCategory;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: SalaryRange;
  benefits: string[];
  source: JobSource;
  sourceUrl: string;
  applicationUrl: string;
  postedDate: Date;
  deadline?: Date;
  isRemote: boolean;
  experienceLevel: ExperienceLevel;
  skills: string[];
  tags: string[];
  companyInfo?: CompanyInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSource {
  name: string;
  url: string;
  type: 'job-board' | 'company-careers' | 'linkedin' | 'indeed' | 'glassdoor';
}

export interface CompanyInfo {
  name: string;
  description: string;
  industry: string;
  size: string;
  founded: number;
  website: string;
  location: string;
  culture: string[];
  benefits: string[];
}

export interface SavedSearch {
  _id: string;
  userId: string;
  name: string;
  query: string;
  filters: JobFilters;
  isActive: boolean;
  schedule: SearchSchedule;
  createdAt: Date;
  lastRun: Date;
}

export interface JobFilters {
  keywords: string[];
  location: string[];
  type: JobType[];
  category: JobCategory[];
  experienceLevel: ExperienceLevel[];
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  companies: string[];
}

export interface SearchSchedule {
  frequency: 'hourly' | 'daily' | 'weekly';
  time?: string;
  days?: number[];
  isActive: boolean;
}

// Enums
export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  INTERNSHIP = 'internship',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  VOLUNTEER = 'volunteer'
}

export enum JobCategory {
  SOFTWARE_ENGINEERING = 'software-engineering',
  DATA_SCIENCE = 'data-science',
  AI_ML = 'ai-ml',
  CYBERSECURITY = 'cybersecurity',
  WEB_DEVELOPMENT = 'web-development',
  MOBILE_DEVELOPMENT = 'mobile-development',
  DEVOPS = 'devops',
  PRODUCT_MANAGEMENT = 'product-management',
  DESIGN = 'design',
  MARKETING = 'marketing',
  SALES = 'sales',
  FINANCE = 'finance',
  HR = 'hr',
  OTHER = 'other'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive'
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'daily' | 'monthly' | 'yearly';
}

// Resume and Cover Letter Types
export interface Resume {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  relevantCourses: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: Date;
  endDate?: Date;
}

export interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface CoverLetter {
  _id: string;
  userId: string;
  jobId: string;
  content: string;
  generatedAt: Date;
  version: number;
}

// Reminder and Schedule Types
export interface Reminder {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: ReminderType;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  notificationChannels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ReminderType {
  APPLICATION_DEADLINE = 'application-deadline',
  INTERVIEW = 'interview',
  FOLLOW_UP = 'follow-up',
  NETWORKING = 'networking',
  SKILL_DEVELOPMENT = 'skill-development',
  OTHER = 'other'
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  JOB_MATCH = 'job-match',
  DEADLINE_REMINDER = 'deadline-reminder',
  INTERVIEW_REMINDER = 'interview-reminder',
  SYSTEM = 'system',
  APPLICATION_UPDATE = 'application-update'
}

// AI and Chat Types
export interface ChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    voiceInput?: boolean;
    voiceOutput?: boolean;
    context?: string;
  };
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  actions?: AIAction[];
  confidence: number;
}

export interface AIAction {
  type: 'search_jobs' | 'create_reminder' | 'generate_resume' | 'schedule_interview';
  data: any;
  description: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter Types
export interface SearchQuery {
  q: string;
  filters?: JobFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestions: string[];
  relatedSearches: string[];
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;