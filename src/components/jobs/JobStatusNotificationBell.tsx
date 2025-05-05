
import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusUpdateNotifications } from "@/components/admin/StatusUpdateNotifications";

export const JobStatusNotificationBell = () => {
  const { currentUser } = useAuth();
  const { getUnreadStatusUpdates } = useData();
  
  // Only show for admins
  if (currentUser?.role !== "admin") {
    return null;
  }
  
  const unreadStatusUpdates = getUnreadStatusUpdates("admin1");
  const hasUnread = unreadStatusUpdates.length > 0;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center">
              {unreadStatusUpdates.length}
            </Badge>
          )}
          <Bell className={hasUnread ? "text-primary" : "text-muted-foreground"} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="font-medium px-4 py-2 border-b">
          Status Updates
        </div>
        <StatusUpdateNotifications />
      </PopoverContent>
    </Popover>
  );
};
