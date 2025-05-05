
import React from "react";
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  const statusMap: Record<JobStatus, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    draft: { label: "Draft", variant: "outline" },
    open: { label: "Open", variant: "secondary" },
    assigned: { label: "Assigned", variant: "secondary" },
    in_progress: { label: "In Progress", variant: "default" },
    review: { label: "In Review", variant: "default" },
    completed: { label: "Completed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  const { label, variant } = statusMap[status];

  return <Badge variant={variant}>{label}</Badge>;
};
