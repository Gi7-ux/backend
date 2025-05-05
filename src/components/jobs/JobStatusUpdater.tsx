
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Job, JobStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface JobStatusUpdaterProps {
  job: Job;
  updateJob: (job: Partial<Job> & { id: string }) => Job;
}

export const JobStatusUpdater: React.FC<JobStatusUpdaterProps> = ({ job, updateJob }) => {
  const { toast } = useToast();
  
  const statusFlow: Record<JobStatus, { next?: JobStatus, label: string }> = {
    draft: { next: "open", label: "Open For Bids" },
    open: { next: "assigned", label: "Assign Architect" },
    assigned: { next: "in_progress", label: "Start Project" },
    in_progress: { next: "review", label: "Submit For Review" },
    review: { next: "completed", label: "Mark Complete" },
    completed: { label: "Completed" },
    cancelled: { label: "Cancelled" },
  };
  
  const currentStatus = statusFlow[job.status];
  
  const handleStatusUpdate = () => {
    if (!currentStatus.next) return;
    
    updateJob({
      id: job.id,
      status: currentStatus.next,
    });
    
    toast({
      title: "Status Updated",
      description: `The project status has been updated to ${currentStatus.next.replace('_', ' ')}.`,
    });
  };
  
  if (!currentStatus.next) return null;
  
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Project Status</h3>
            <p className="text-sm text-muted-foreground">
              This project is currently in <strong>{job.status.replace('_', ' ')}</strong> status
            </p>
          </div>
          <Button onClick={handleStatusUpdate}>
            {currentStatus.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
