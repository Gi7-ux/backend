import React, { createContext, useContext, useState } from "react";
import { Job, Task, TimeEntry, Message, User, JobReport, DEFAULT_CURRENCY, StatusUpdate, AdminComment } from "@/types";
import { mockJobs, mockTasks, mockTimeEntries, mockMessages, mockUsers } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  jobs: Job[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  messages: Message[];
  mockUsers: User[];
  jobReports: JobReport[];
  statusUpdates: StatusUpdate[];
  adminComments: AdminComment[];
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt" | "currency">) => Job;
  updateJob: (job: Partial<Job> & { id: string }) => Job;
  deleteJob: (jobId: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (task: Partial<Task> & { id: string }) => Task;
  deleteTask: (taskId: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => TimeEntry;
  updateTimeEntry: (entry: Partial<TimeEntry> & { id: string }) => TimeEntry;
  deleteTimeEntry: (entryId: string) => void;
  addMessage: (message: Omit<Message, "id" | "createdAt" | "isRead">) => Message;
  markMessageAsRead: (messageId: string) => void;
  getJobById: (id: string) => Job | undefined;
  getTasksByJobId: (jobId: string) => Task[];
  getTimeEntriesByTaskId: (taskId: string) => TimeEntry[];
  getTimeEntriesByJobId: (jobId: string) => TimeEntry[];
  getTotalTimeForTask: (taskId: string) => number;
  getTotalTimeForJob: (jobId: string) => number;
  getJobReports: (jobId: string) => JobReport[];
  addJobReport: (report: Omit<JobReport, "id" | "createdAt">) => JobReport;
  updateJobReport: (report: Partial<JobReport> & { id: string }) => JobReport;
  getMessagesBetweenUsers: (user1Id: string, user2Id: string) => Message[];
  getUserMessages: (userId: string) => Message[];
  getTaskById: (taskId: string) => Task | undefined;
  getClientById: (clientId: string) => User | undefined;
  getArchitectById: (architectId: string) => User | undefined;
  // New functions for status updates
  addStatusUpdate: (update: Omit<StatusUpdate, "id" | "createdAt" | "isRead" | "adminComments">) => StatusUpdate;
  getStatusUpdatesByJobId: (jobId: string) => StatusUpdate[];
  getUnreadStatusUpdates: (adminId: string) => StatusUpdate[];
  markStatusUpdateAsRead: (statusUpdateId: string) => void;
  // New functions for admin comments
  addAdminComment: (comment: Omit<AdminComment, "id" | "createdAt" | "isRead">) => AdminComment;
  getAdminCommentsByStatusUpdateId: (statusUpdateId: string) => AdminComment[];
  markAdminCommentAsRead: (commentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fix for existing jobs that may not have currency field
  const updatedMockJobs = mockJobs.map(job => ({
    ...job,
    currency: job.currency || DEFAULT_CURRENCY
  }));

  const [jobs, setJobs] = useState<Job[]>(updatedMockJobs);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [jobReports, setJobReports] = useState<JobReport[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [adminComments, setAdminComments] = useState<AdminComment[]>([]);

  // Job operations
  const addJob = (jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "currency">) => {
    const newJob: Job = {
      ...jobData,
      id: `job${jobs.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      currency: DEFAULT_CURRENCY
    };
    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const updateJob = (jobData: Partial<Job> & { id: string }) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobData.id ? { ...job, ...jobData, updatedAt: new Date() } : job
    );
    setJobs(updatedJobs);
    return updatedJobs.find(job => job.id === jobData.id) as Job;
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    // Also delete related tasks and time entries
    const relatedTasks = getTasksByJobId(jobId);
    relatedTasks.forEach(task => {
      deleteTask(task.id);
    });
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  // Task operations
  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task${tasks.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskData: Partial<Task> & { id: string }) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskData.id ? { ...task, ...taskData, updatedAt: new Date() } : task
    );
    setTasks(updatedTasks);
    return updatedTasks.find(task => task.id === taskData.id) as Task;
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    // Also delete related time entries
    setTimeEntries(prev => prev.filter(entry => entry.taskId !== taskId));
  };

  const getTasksByJobId = (jobId: string) => {
    return tasks.filter(task => task.jobId === jobId);
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  // TimeEntry operations
  const addTimeEntry = (entryData: Omit<TimeEntry, "id">) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `entry${timeEntries.length + 1}`,
    };
    setTimeEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateTimeEntry = (entryData: Partial<TimeEntry> & { id: string }) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === entryData.id ? { ...entry, ...entryData } : entry
    );
    setTimeEntries(updatedEntries);
    return updatedEntries.find(entry => entry.id === entryData.id) as TimeEntry;
  };

  const deleteTimeEntry = (entryId: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const getTimeEntriesByTaskId = (taskId: string) => {
    return timeEntries.filter(entry => entry.taskId === taskId);
  };

  const getTimeEntriesByJobId = (jobId: string) => {
    const jobTasks = getTasksByJobId(jobId);
    const taskIds = jobTasks.map(task => task.id);
    return timeEntries.filter(entry => taskIds.includes(entry.taskId));
  };

  const getTotalTimeForTask = (taskId: string) => {
    return getTimeEntriesByTaskId(taskId).reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  };

  const getTotalTimeForJob = (jobId: string) => {
    const jobEntries = getTimeEntriesByJobId(jobId);
    return jobEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  };

  // Job Report operations
  const getJobReports = (jobId: string) => {
    return jobReports.filter(report => report.jobId === jobId);
  };

  const addJobReport = (reportData: Omit<JobReport, "id" | "createdAt">) => {
    const newReport: JobReport = {
      ...reportData,
      id: `report${jobReports.length + 1}`,
      createdAt: new Date(),
    };
    setJobReports(prev => [...prev, newReport]);
    return newReport;
  };

  const updateJobReport = (reportData: Partial<JobReport> & { id: string }) => {
    const updatedReports = jobReports.map(report => 
      report.id === reportData.id ? { ...report, ...reportData } : report
    );
    setJobReports(updatedReports);
    return updatedReports.find(report => report.id === reportData.id) as JobReport;
  };

  // Message operations
  const addMessage = (messageData: Omit<Message, "id" | "createdAt" | "isRead">) => {
    const newMessage: Message = {
      ...messageData,
      id: `msg${messages.length + 1}`,
      createdAt: new Date(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const markMessageAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    setMessages(updatedMessages);
  };

  const getMessagesBetweenUsers = (user1Id: string, user2Id: string) => {
    return messages.filter(msg => 
      (msg.senderId === user1Id && msg.recipientId === user2Id) || 
      (msg.senderId === user2Id && msg.recipientId === user1Id)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };

  const getUserMessages = (userId: string) => {
    return messages.filter(msg => 
      msg.senderId === userId || msg.recipientId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // User operations
  const getClientById = (clientId: string) => {
    return mockUsers.find(user => user.id === clientId && user.role === 'client');
  };

  const getArchitectById = (architectId: string) => {
    return mockUsers.find(user => user.id === architectId && user.role === 'architect');
  };

  // Status update operations
  const addStatusUpdate = (updateData: Omit<StatusUpdate, "id" | "createdAt" | "isRead" | "adminComments">) => {
    const newUpdate: StatusUpdate = {
      ...updateData,
      id: `update${statusUpdates.length + 1}`,
      createdAt: new Date(),
      isRead: false,
      adminComments: []
    };
    setStatusUpdates(prev => [...prev, newUpdate]);
    
    // Notify admin via toast
    const job = jobs.find(j => j.id === updateData.jobId);
    const architect = mockUsers.find(u => u.id === updateData.architectId);
    
    toast({
      title: "New Status Update",
      description: `${architect?.name} submitted an update for project "${job?.title}"`,
    });
    
    return newUpdate;
  };

  const getStatusUpdatesByJobId = (jobId: string) => {
    return statusUpdates.filter(update => update.jobId === jobId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getUnreadStatusUpdates = (adminId: string) => {
    return statusUpdates.filter(update => !update.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const markStatusUpdateAsRead = (statusUpdateId: string) => {
    const updatedStatusUpdates = statusUpdates.map(update => 
      update.id === statusUpdateId ? { ...update, isRead: true } : update
    );
    setStatusUpdates(updatedStatusUpdates);
  };

  // Admin comment operations
  const addAdminComment = (commentData: Omit<AdminComment, "id" | "createdAt" | "isRead">) => {
    const newComment: AdminComment = {
      ...commentData,
      id: `comment${adminComments.length + 1}`,
      createdAt: new Date(),
      isRead: false
    };
    setAdminComments(prev => [...prev, newComment]);
    
    // Notify architect via toast
    const statusUpdate = statusUpdates.find(update => update.id === commentData.statusUpdateId);
    const job = jobs.find(j => j.id === statusUpdate?.jobId);
    const admin = mockUsers.find(u => u.id === commentData.adminId);
    
    toast({
      title: "New Admin Comment",
      description: `${admin?.name} commented on your update for "${job?.title}"`,
    });
    
    return newComment;
  };

  const getAdminCommentsByStatusUpdateId = (statusUpdateId: string) => {
    return adminComments.filter(comment => comment.statusUpdateId === statusUpdateId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };

  const markAdminCommentAsRead = (commentId: string) => {
    const updatedAdminComments = adminComments.map(comment => 
      comment.id === commentId ? { ...comment, isRead: true } : comment
    );
    setAdminComments(updatedAdminComments);
  };

  return (
    <DataContext.Provider value={{
      jobs,
      tasks,
      timeEntries,
      messages,
      mockUsers,
      jobReports,
      statusUpdates,
      adminComments,
      addJob,
      updateJob,
      deleteJob,
      addTask,
      updateTask,
      deleteTask,
      addTimeEntry,
      updateTimeEntry,
      deleteTimeEntry,
      addMessage,
      markMessageAsRead,
      getJobById,
      getTasksByJobId,
      getTimeEntriesByTaskId,
      getTimeEntriesByJobId,
      getTotalTimeForTask,
      getTotalTimeForJob,
      getJobReports,
      addJobReport,
      updateJobReport,
      getMessagesBetweenUsers,
      getUserMessages,
      getTaskById,
      getClientById,
      getArchitectById,
      // New status update functions
      addStatusUpdate,
      getStatusUpdatesByJobId,
      getUnreadStatusUpdates,
      markStatusUpdateAsRead,
      // New admin comment functions
      addAdminComment,
      getAdminCommentsByStatusUpdateId,
      markAdminCommentAsRead,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
