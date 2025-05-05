import { User, Job, Task, TimeEntry, Message } from "@/types";

// Mock users
export const mockUsers: User[] = [
  {
    id: "client1",
    email: "client@example.com",
    name: "Alex Johnson",
    role: "client",
    createdAt: new Date('2023-01-15'),
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: "architect1",
    email: "architect@example.com",
    name: "Sam Rodriguez",
    role: "architect",
    createdAt: new Date('2023-02-10'),
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    hourlyRate: 850
  },
  {
    id: "admin1",
    email: "admin@example.com",
    name: "Jordan Taylor",
    role: "admin",
    createdAt: new Date('2023-01-01'),
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
  },
];

// Mock jobs
export const mockJobs: Job[] = [
  {
    id: "job1",
    title: "Modern Residential House Design",
    description: "Design a 3-bedroom modern residential house with eco-friendly features and open floor plan.",
    clientId: "client1",
    architectId: "architect1",
    status: "in_progress",
    budget: 15000,
    deadline: new Date('2023-12-15'),
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-12'),
    currency: "ZAR"
  },
  {
    id: "job2",
    title: "Commercial Office Renovation",
    description: "Redesign and renovation plans for a 10,000 sqft commercial office space in downtown area.",
    clientId: "client1",
    status: "open",
    budget: 25000,
    deadline: new Date('2024-02-28'),
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
    currency: "ZAR"
  },
  {
    id: "job3",
    title: "Restaurant Interior Design",
    description: "Complete interior design for a new upscale Italian restaurant, including furniture selection and lighting design.",
    clientId: "client1",
    status: "draft",
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20'),
    currency: "ZAR"
  },
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: "task1",
    jobId: "job1",
    title: "Site Analysis",
    description: "Analyze the site conditions, orientation, and surrounding context.",
    assignedTo: "architect1",
    status: "completed",
    estimatedHours: 8,
    createdAt: new Date('2023-06-12'),
    updatedAt: new Date('2023-06-15'),
  },
  {
    id: "task2",
    jobId: "job1",
    title: "Concept Design Development",
    description: "Develop initial concept sketches and design direction based on client requirements.",
    assignedTo: "architect1",
    status: "in_progress",
    estimatedHours: 20,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-18'),
  },
  {
    id: "task3",
    jobId: "job1",
    title: "Floor Plan Development",
    description: "Create detailed floor plans based on approved concept.",
    assignedTo: "architect1",
    status: "todo",
    estimatedHours: 15,
    createdAt: new Date('2023-06-18'),
    updatedAt: new Date('2023-06-18'),
  },
];

// Mock time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    id: "entry1",
    taskId: "task1",
    architectId: "architect1",
    startTime: new Date('2023-06-13T09:00:00'),
    endTime: new Date('2023-06-13T13:00:00'),
    duration: 240, // 4 hours
    notes: "Completed site visit and initial analysis",
    isManual: false,
  },
  {
    id: "entry2",
    taskId: "task1",
    architectId: "architect1",
    startTime: new Date('2023-06-14T10:00:00'),
    endTime: new Date('2023-06-14T14:00:00'),
    duration: 240, // 4 hours
    notes: "Finalized site analysis report",
    isManual: false,
  },
  {
    id: "entry3",
    taskId: "task2",
    architectId: "architect1",
    startTime: new Date('2023-06-16T09:00:00'),
    endTime: new Date('2023-06-16T17:00:00'),
    duration: 480, // 8 hours
    notes: "Started concept sketching",
    isManual: false,
  },
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: "msg1",
    senderId: "architect1",
    recipientId: "admin1",
    content: "I've completed the site analysis for the residential project. Can we discuss the next steps?",
    jobId: "job1",
    isRead: true,
    createdAt: new Date('2023-06-15T11:30:00'),
  },
  {
    id: "msg2",
    senderId: "admin1",
    recipientId: "architect1",
    content: "Great work on the site analysis! Let's schedule a meeting to review the concept design phase.",
    jobId: "job1",
    isRead: false,
    createdAt: new Date('2023-06-15T14:45:00'),
  },
];
