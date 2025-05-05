
import React from "react";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const StatusUpdateNotifications = () => {
  const { 
    getUnreadStatusUpdates, 
    mockUsers, 
    getJobById, 
    markStatusUpdateAsRead 
  } = useData();
  const navigate = useNavigate();

  const unreadStatusUpdates = getUnreadStatusUpdates("admin1");
  
  if (unreadStatusUpdates.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No new status updates
      </div>
    );
  }

  const handleViewUpdate = (jobId: string, updateId: string) => {
    markStatusUpdateAsRead(updateId);
    navigate(`/jobs/${jobId}?tab=reports&section=updates`);
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="p-2 space-y-2">
        {unreadStatusUpdates.map((update) => {
          const architect = mockUsers.find(user => user.id === update.architectId);
          const job = getJobById(update.jobId);
          
          if (!architect || !job) return null;
          
          return (
            <Card
              key={update.id}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleViewUpdate(update.jobId, update.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-sm">{architect.name}</span>
                    <Badge variant="outline" className="text-xs">Architect</Badge>
                    {!update.isRead && (
                      <Badge className="text-xs" variant="default">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(new Date(update.createdAt), "MMM d, h:mm a")}
                  </p>
                  <p className="text-sm font-medium">{job.title}</p>
                </div>
              </div>
              <p className="text-sm mt-2 line-clamp-2">{update.content}</p>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
