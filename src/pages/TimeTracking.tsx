
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { TimeTracker } from "@/components/TimeTracker";

const TimeTracking = () => {
  const { currentUser } = useAuth();
  const { timeEntries } = useData();
  
  // Only architect users can access this page
  if (currentUser?.role !== "architect") {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Time tracking is only available for architects.
        </p>
      </div>
    );
  }
  
  // Filter time entries for the current architect
  const myTimeEntries = timeEntries.filter(entry => entry.architectId === currentUser.id);
  
  // Get today's entries
  const today = new Date();
  const todaysEntries = myTimeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  });
  
  // Calculate total hours today
  const totalHoursToday = todaysEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0) / 60; // Convert minutes to hours

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Time Tracking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker Card */}
        <div className="lg:col-span-1">
          <TimeTracker />
        </div>

        {/* Today's Activity Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Time logged today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {todaysEntries.length > 0 ? (
                todaysEntries.map((entry, index) => {
                  // Find task details for this entry
                  const task = entry.taskId ? 
                    global.tasks?.find(t => t.id === entry.taskId) : 
                    null;
                  
                  // Find job details for this task
                  const job = task?.jobId ? 
                    global.jobs?.find(j => j.id === task.jobId) : 
                    null;
                  
                  // Format time range
                  const startTime = new Date(entry.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const endTime = entry.endTime ? 
                    new Date(entry.endTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 
                    "ongoing";
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{job?.title || "Unknown Project"}</div>
                          <div className="text-sm text-muted-foreground">
                            {task?.title || "Unknown Task"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {startTime} - {endTime}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {(entry.duration || 0) / 60} hours
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No time entries for today</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-1" />
              {new Date().toLocaleDateString()}
            </div>
            <div className="font-medium">Total: {totalHoursToday.toFixed(1)} hours</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TimeTracking;
