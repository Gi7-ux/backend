
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { MessageSquare, User } from "lucide-react";

interface StatusUpdatesProps {
  jobId: string;
}

export const StatusUpdates: React.FC<StatusUpdatesProps> = ({ jobId }) => {
  const { currentUser } = useAuth();
  const { 
    getStatusUpdatesByJobId, 
    getAdminCommentsByStatusUpdateId, 
    addAdminComment,
    markStatusUpdateAsRead,
    markAdminCommentAsRead,
    mockUsers
  } = useData();
  
  const statusUpdates = getStatusUpdatesByJobId(jobId);
  
  // Mark unread updates as read if admin is viewing
  useEffect(() => {
    if (currentUser?.role === "admin") {
      statusUpdates.forEach(update => {
        if (!update.isRead) {
          markStatusUpdateAsRead(update.id);
        }
      });
    }
  }, [statusUpdates, currentUser]);
  
  const getUserById = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };
  
  const AdminCommentForm = ({ statusUpdateId }: { statusUpdateId: string }) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
      defaultValues: { content: "" }
    });
    
    const onSubmit = (data: { content: string }) => {
      if (!currentUser) return;
      
      addAdminComment({
        statusUpdateId,
        adminId: currentUser.id,
        content: data.content
      });
      
      reset();
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the status update"
      });
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
    const comments = getAdminCommentsByStatusUpdateId(statusUpdateId);
    
    // Mark unread comments as read if architect is viewing
    useEffect(() => {
      if (currentUser?.role === "architect") {
        comments.forEach(comment => {
          if (!comment.isRead) {
            markAdminCommentAsRead(comment.id);
          }
        });
      }
    }, [comments, currentUser]);
    
    if (comments.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-3 pl-8">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Comments
        </h4>
        {comments.map(comment => {
          const admin = getUserById(comment.adminId);
          
          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={admin?.avatarUrl} />
                <AvatarFallback>{admin?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted/40 rounded-md p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-xs">{admin?.name} (Admin)</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
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
              const architect = getUserById(update.architectId);
              
              return (
                <div key={update.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={architect?.avatarUrl} />
                      <AvatarFallback>{architect?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/30 rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-3 w-3" /> 
                            {architect?.name} <span className="text-xs text-muted-foreground">(Architect)</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.createdAt), "MMM d, h:mm a")}
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
