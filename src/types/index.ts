
export type UserRole = "client" | "architect" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  hourlyRate?: number; // Added here to fix the typing issue
}

export interface Client extends User {
  role: "client";
  company?: string;
  contactNumber?: string;
}

export interface Architect extends User {
  role: "architect";
  skills?: string[];
  portfolio?: string;
  hourlyRate?: number;
  isApproved?: boolean;
}

export interface Admin extends User {
  role: "admin";
}

export type JobStatus = "draft" | "open" | "assigned" | "in_progress" | "review" | "completed" | "cancelled";

export interface Job {
  id: string;
  title: string;
  description: string;
  clientId: string;
  architectId?: string;
  status: JobStatus;
  budget?: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  projectType?: string;
  documents?: string[];
  notes?: string;
  paymentStatus?: "pending" | "partial" | "completed";
  currency: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export interface Task {
  id: string;
  jobId: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: TaskStatus;
  estimatedHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  architectId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  isManual: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  jobId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface JobReport {
  id: string;
  jobId: string;
  createdAt: Date;
  timeSpent: number;
  costToDate: number;
  completionPercentage: number;
  notes?: string;
}

// New interface for status updates from architects
export interface StatusUpdate {
  id: string;
  jobId: string;
  architectId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  adminComments?: AdminComment[];
}

// New interface for admin comments on status updates
export interface AdminComment {
  id: string;
  statusUpdateId: string;
  adminId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape"
];

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Renovation",
  "Interior Design",
  "Landscape",
  "Urban Planning",
  "Heritage Conservation",
  "Green Building"
];

export const CURRENCIES = [
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" }
];

export const DEFAULT_CURRENCY = "ZAR";
