
import React from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMinutesToHours } from "@/lib/formatters";

interface JobTimelineProps {
  jobId: string;
}

export const JobTimeline: React.FC<JobTimelineProps> = ({ jobId }) => {
  const { getTasksByJobId, getTimeEntriesByTaskId, getArchitectById } = useData();
  const tasks = getTasksByJobId(jobId);
  
  // Collect all time entries for the job
  const allTimeEntries = tasks.flatMap(task => {
    const entries = getTimeEntriesByTaskId(task.id);
    return entries.map(entry => ({
      ...entry,
      taskTitle: task.title,
    }));
  });
  
  // Sort by date (most recent first)
  const sortedEntries = allTimeEntries.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  if (sortedEntries.length === 0) {
    return (
      <Card className="text-center p-8">
        <p className="text-muted-foreground">No time entries recorded for this project yet.</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {sortedEntries.map((entry, index) => {
        const architect = getArchitectById(entry.architectId);
        const date = new Date(entry.startTime);
        const formattedDate = new Intl.DateTimeFormat('en-ZA', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(date);
        
        const formattedTime = new Intl.DateTimeFormat('en-ZA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date);
        
        return (
          <React.Fragment key={entry.id}>
            <div className="flex gap-4">
              <div className="min-w-28 text-sm text-muted-foreground">
                {formattedDate}<br/>
                {formattedTime}
              </div>
              <div>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs mb-2">
                  {architect?.name.charAt(0) || "?"}
                </div>
                <Separator orientation="vertical" className="absolute h-full" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {architect?.name || "Unknown"} worked on {entry.taskTitle}
                </h4>
                {entry.duration && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Duration: {formatMinutesToHours(entry.duration)}
                  </p>
                )}
                {entry.notes && (
                  <p className="text-sm mt-2 bg-muted/30 p-3 rounded-md">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>
            {index < sortedEntries.length - 1 && <Separator />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
