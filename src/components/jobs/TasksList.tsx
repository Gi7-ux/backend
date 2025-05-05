
import React from "react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileEdit } from "lucide-react";
import { formatMinutesToHours } from "@/lib/formatters";

interface TasksListProps {
  jobId: string;
}

export const TasksList: React.FC<TasksListProps> = ({ jobId }) => {
  const { getTasksByJobId, getTotalTimeForTask, getArchitectById } = useData();
  const tasks = getTasksByJobId(jobId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "todo":
        return "outline";
      case "in_progress":
        return "default";
      case "review":
        return "secondary";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="text-center p-8">
        <p className="mb-4 text-muted-foreground">No tasks have been created yet for this project.</p>
        <Link to={`/jobs/${jobId}/tasks/new`}>
          <Button>Create First Task</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => {
        const totalTime = getTotalTimeForTask(task.id);
        const assignedUser = task.assignedTo ? getArchitectById(task.assignedTo) : undefined;
        
        return (
          <div key={task.id} className="rounded-md border p-4 hover:bg-accent/5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status === "in_progress" ? "In Progress" : 
                     task.status === "todo" ? "To Do" : 
                     task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
              </div>
              <Link to={`/jobs/${jobId}/tasks/${task.id}/edit`}>
                <Button size="icon" variant="ghost">
                  <FileEdit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {assignedUser ? (
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 text-xs">
                      {assignedUser.name.charAt(0)}
                    </div>
                    <span>{assignedUser.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </div>
              <div className="text-muted-foreground">
                {totalTime > 0 ? `Time spent: ${formatMinutesToHours(totalTime)}` : "No time logged"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
