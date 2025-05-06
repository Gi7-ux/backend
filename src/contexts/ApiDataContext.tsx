import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Job, Task, TimeEntry, Message, User, JobReport, StatusUpdate, AdminComment } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";
import { statusUpdateService } from "@/lib/api/statusUpdateService";

interface ApiDataContextType {
  // Status updates
  statusUpdates: StatusUpdate[];
  statusUpdatesLoading: boolean;
  statusUpdatesError: string | null;
  fetchStatusUpdates: (jobId?: string) => Promise<void>;
  addStatusUpdate: (update: Omit<StatusUpdate, "id" | "createdAt" | "isRead" | "adminComments">) => Promise<StatusUpdate>;
  markStatusUpdateAsRead: (statusUpdateId: string) => Promise<void>;
  deleteStatusUpdate: (statusUpdateId: string) => Promise<void>;
  
  // Admin comments
  adminComments: Record<string, AdminComment[]>; // Keyed by status update ID
  adminCommentsLoading: boolean;
  adminCommentsError: string | null;
  fetchAdminComments: (statusUpdateId: string) => Promise<void>;
  addAdminComment: (comment: { statusUpdateId: string, content: string }) => Promise<AdminComment>;
  markAdminCommentAsRead: (commentId: string) => Promise<void>;
  deleteAdminComment: (commentId: string) => Promise<void>;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

export const ApiDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Status updates state
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [statusUpdatesLoading, setStatusUpdatesLoading] = useState<boolean>(false);
  const [statusUpdatesError, setStatusUpdatesError] = useState<string | null>(null);
  
  // Admin comments state (keyed by status update ID)
  const [adminComments, setAdminComments] = useState<Record<string, AdminComment[]>>({});
  const [adminCommentsLoading, setAdminCommentsLoading] = useState<boolean>(false);
  const [adminCommentsError, setAdminCommentsError] = useState<string | null>(null);
  
  // Fetch status updates
  const fetchStatusUpdates = useCallback(async (jobId?: string) => {
    setStatusUpdatesLoading(true);
    setStatusUpdatesError(null);
    
    try {
      const params: any = {};
      if (jobId) {
        params.job_id = jobId;
      }
      
      const response = await statusUpdateService.getStatusUpdates(params);
      setStatusUpdates(response.data);
    } catch (error) {
      console.error('Error fetching status updates:', error);
      setStatusUpdatesError('Failed to load status updates');
      toast({
        title: "Error",
        description: "Failed to load status updates",
        variant: "destructive"
      });
    } finally {
      setStatusUpdatesLoading(false);
    }
  }, []);
  
  // Add status update
  const addStatusUpdate = async (updateData: Omit<StatusUpdate, "id" | "createdAt" | "isRead" | "adminComments">) => {
    try {
      const response = await statusUpdateService.createStatusUpdate({
        job_id: updateData.jobId,
        content: updateData.content
      });
      
      const newUpdate = response.data;
      setStatusUpdates(prev => [newUpdate, ...prev]);
      
      toast({
        title: "Success",
        description: "Status update submitted successfully"
      });
      
      return newUpdate;
    } catch (error) {
      console.error('Error creating status update:', error);
      toast({
        title: "Error",
        description: "Failed to submit status update",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Mark status update as read
  const markStatusUpdateAsRead = async (statusUpdateId: string) => {
    try {
      await statusUpdateService.markStatusUpdateAsRead(statusUpdateId);
      
      setStatusUpdates(prev => 
        prev.map(update => 
          update.id === statusUpdateId ? { ...update, is_read: true } : update
        )
      );
    } catch (error) {
      console.error('Error marking status update as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark status update as read",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Delete status update
  const deleteStatusUpdate = async (statusUpdateId: string) => {
    try {
      await statusUpdateService.deleteStatusUpdate(statusUpdateId);
      
      setStatusUpdates(prev => prev.filter(update => update.id !== statusUpdateId));
      
      toast({
        title: "Success",
        description: "Status update deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting status update:', error);
      toast({
        title: "Error",
        description: "Failed to delete status update",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Fetch admin comments for a status update
  const fetchAdminComments = async (statusUpdateId: string) => {
    setAdminCommentsLoading(true);
    setAdminCommentsError(null);
    
    try {
      const response = await statusUpdateService.getAdminComments(statusUpdateId);
      
      setAdminComments(prev => ({
        ...prev,
        [statusUpdateId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching admin comments:', error);
      setAdminCommentsError('Failed to load admin comments');
      toast({
        title: "Error",
        description: "Failed to load admin comments",
        variant: "destructive"
      });
    } finally {
      setAdminCommentsLoading(false);
    }
  };
  
  // Add admin comment
  const addAdminComment = async (commentData: { statusUpdateId: string, content: string }) => {
    try {
      const response = await statusUpdateService.createAdminComment(
        commentData.statusUpdateId,
        { content: commentData.content }
      );
      
      const newComment = response.data;
      
      setAdminComments(prev => ({
        ...prev,
        [commentData.statusUpdateId]: [
          ...(prev[commentData.statusUpdateId] || []),
          newComment
        ]
      }));
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
      
      return newComment;
    } catch (error) {
      console.error('Error adding admin comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Mark admin comment as read
  const markAdminCommentAsRead = async (commentId: string) => {
    try {
      await statusUpdateService.markAdminCommentAsRead(commentId);
      
      setAdminComments(prev => {
        const newComments = { ...prev };
        
        // Find which status update this comment belongs to
        for (const statusUpdateId in newComments) {
          newComments[statusUpdateId] = newComments[statusUpdateId].map(comment => 
            comment.id === commentId ? { ...comment, is_read: true } : comment
          );
        }
        
        return newComments;
      });
    } catch (error) {
      console.error('Error marking admin comment as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark comment as read",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Delete admin comment
  const deleteAdminComment = async (commentId: string) => {
    try {
      await statusUpdateService.deleteAdminComment(commentId);
      
      setAdminComments(prev => {
        const newComments = { ...prev };
        
        // Find which status update this comment belongs to and remove the comment
        for (const statusUpdateId in newComments) {
          newComments[statusUpdateId] = newComments[statusUpdateId].filter(
            comment => comment.id !== commentId
          );
        }
        
        return newComments;
      });
      
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting admin comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <ApiDataContext.Provider value={{
      // Status updates
      statusUpdates,
      statusUpdatesLoading,
      statusUpdatesError,
      fetchStatusUpdates,
      addStatusUpdate,
      markStatusUpdateAsRead,
      deleteStatusUpdate,
      
      // Admin comments
      adminComments,
      adminCommentsLoading,
      adminCommentsError,
      fetchAdminComments,
      addAdminComment,
      markAdminCommentAsRead,
      deleteAdminComment,
    }}>
      {children}
    </ApiDataContext.Provider>
  );
};

export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
};
