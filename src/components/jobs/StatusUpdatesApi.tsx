import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useApiData } from "@/contexts/ApiDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { StatusUpdate, AdminComment } from "@/types";

interface StatusUpdatesApiProps {
  jobId: string;
}

export const StatusUpdatesApi: React.FC<StatusUpdatesApiProps> = ({ jobId }) => {
  const { currentUser } = useAuth();
  const { mockUsers } = useData();
  const { 
    statusUpdates,
    statusUpdatesLoading,
    statusUpdatesError,
    fetchStatusUpdates,
    markStatusUpdateAsRead,
    adminComments,
    fetchAdminComments,
    addAdminComment,
    markAdminCommentAsRead,
    adminCommentsLoading
  } = useApiData();
  
  // Fetch status updates when component mounts
  useEffect(() => {
    fetchStatusUpdates(jobId);
  }, [fetchStatusUpdates, jobId]);
  
  // Mark unread updates as read if admin is viewing
  useEffect(() => {
    if (currentUser?.role === "admin") {
      statusUpdates.forEach(async (update) => {
        if (!update.is_read) {
          await markStatusUpdateAsRead(update.id);
        }
      });
    }
  }, [statusUpdates, currentUser, markStatusUpdateAsRead]);
  
  // Fetch admin comments for each status update
  useEffect(() => {
    statusUpdates.forEach(update => {
      if (!adminComments[update.id]) {
        fetchAdminComments(update.id);
      }
    });
  }, [statusUpdates, adminComments, fetchAdminComments]);
  
  const getUserById = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };
  
  const AdminCommentForm = ({ statusUpdateId }: { statusUpdateId: string }) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
      defaultValues: { content: "" }
    });
    
    const onSubmit = async (data: { content: string }) => {
      if (!currentUser) return;
      
      try {
        await addAdminComment({
          statusUpdateId,
          content: data.content
        });
        
        reset();
      } catch (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive"
        });
      }
    };
    
    if (currentUser?.role !== "admin") return null;
    
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <Textarea
          placeholder="Write a comment..."
          {...register("content", { required: true })}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? "Sending..." : "Send Comment"}
          </Button>
        </div>
      </form>
    );
  };
  
  const AdminComments = ({ statusUpdateId }: { statusUpdateId: string }) => {
    const updateComments = adminComments[statusUpdateId] || [];
    const isLoading = adminCommentsLoading;
    
    // Mark unread comments as read if architect is viewing
    useEffect(() => {
      if (currentUser?.role === "architect") {
        updateComments.forEach(async (comment) => {
          if (!comment.is_read) {
            await markAdminCommentAsRead(comment.id);
          }
        });
      }
    }, [updateComments, currentUser]);
    
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (updateComments.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-3 pl-8">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Comments
        </h4>
        {updateComments.map(comment => {
          const admin = getUserById(comment.admin_id);
          
          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={admin?.avatarUrl} />
                <AvatarFallback>{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-md p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-xs">{admin?.name || 'Admin'} (Admin)</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (statusUpdatesLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading status updates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (statusUpdatesError) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-destructive mb-2">Failed to load status updates</p>
            <Button onClick={() => fetchStatusUpdates(jobId)} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {currentUser?.role === "architect" && (
        <StatusUpdateForm jobId={jobId} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Status Updates</CardTitle>
          {statusUpdates.length === 0 && (
            <CardDescription>
              No status updates have been submitted for this project yet.
            </CardDescription>
          )}
        </CardHeader>
        {statusUpdates.length > 0 && (
          <CardContent className="space-y-6">
            {statusUpdates.map(update => {
              const architect = getUserById(update.user_id);
              
              return (
                <div key={update.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={architect?.avatarUrl} />
                      <AvatarFallback>{architect?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/30 rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-3 w-3" /> 
                            {architect?.name || 'Architect'} <span className="text-xs text-muted-foreground">(Architect)</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{update.content}</p>
                      </div>
                      
                      <AdminComments statusUpdateId={update.id} />
                      <AdminCommentForm statusUpdateId={update.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
