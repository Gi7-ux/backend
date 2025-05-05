
import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer, StopCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Task } from "@/types";

interface TimeTrackerProps {
  jobId?: string; // Optional - if provided, only shows tasks for this job
  taskId?: string; // Optional - if provided, preselects this task
  compact?: boolean; // Optional - for a more compact view
}

export function TimeTracker({ jobId, taskId, compact = false }: TimeTrackerProps) {
  const { currentUser } = useAuth();
  const { jobs, tasks, addTimeEntry } = useData();
  const { toast } = useToast();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(taskId || null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Filter tasks that are assigned to the current architect
  const myTasks = tasks.filter(task => 
    task.assignedTo === currentUser?.id && 
    (!jobId || task.jobId === jobId)
  );
  
  // Find jobs for those tasks
  const myJobs = jobs.filter(job => 
    myTasks.some(task => task.jobId === job.id)
  );
  
  // Group tasks by job
  const tasksByJob = myJobs.map(job => ({
    job,
    tasks: myTasks.filter(task => task.jobId === job.id)
  }));

  // Setup and cleanup for timer
  useEffect(() => {
    if (isTracking) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setActiveTimer(timer);
      return () => clearInterval(timer);
    } else if (activeTimer) {
      clearInterval(activeTimer);
    }
  }, [isTracking]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!selectedTaskId) {
      toast({
        title: "Error",
        description: "Please select a task first",
        variant: "destructive",
      });
      return;
    }
    
    setStartTime(new Date());
    setIsTracking(true);
    setElapsedTime(0);
    
    toast({
      title: "Timer started",
      description: "Time tracking has started for the selected task",
    });
  };

  const handleStopTimer = () => {
    if (!isTracking || !startTime || !selectedTaskId) return;
    
    const endTime = new Date();
    const durationInMinutes = Math.round(elapsedTime / 60);
    
    // Create a new time entry
    addTimeEntry({
      taskId: selectedTaskId,
      architectId: currentUser!.id,
      startTime: startTime,
      endTime: endTime,
      duration: durationInMinutes,
      isManual: false,
    });
    
    // Reset timer state
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    
    toast({
      title: "Time entry saved",
      description: `Logged ${durationInMinutes} minutes for the selected task`,
    });
  };

  const handleTaskSelect = (taskId: string) => {
    if (isTracking) {
      toast({
        title: "Stop timer first",
        description: "Please stop the current timer before changing tasks",
        variant: "destructive",
      });
      return;
    }
    setSelectedTaskId(taskId);
  };

  // Only architects can track time
  if (currentUser?.role !== "architect") {
    return null;
  }

  // Get the selected task details if any
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  const selectedJobId = selectedTask?.jobId;
  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            {!selectedTaskId && (
              <Select value={selectedTaskId || ""} onValueChange={handleTaskSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasksByJob.map(({ job, tasks }) => (
                    <div key={job.id}>
                      <div className="px-2 py-1.5 text-sm font-semibold">{job.title}</div>
                      {tasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedTaskId && (
              <>
                {selectedTask && selectedJob && (
                  <div className="text-sm font-medium">
                    <p>{selectedJob.title}</p>
                    <p className="text-muted-foreground">{selectedTask.title}</p>
                  </div>
                )}
                
                <div className="text-center p-2 rounded-md bg-secondary">
                  <div className="text-xl font-mono">{formatTime(elapsedTime)}</div>
                </div>
                
                <div className="grid grid-cols-1">
                  {!isTracking ? (
                    <Button 
                      onClick={handleStartTimer} 
                      className="timer-control start"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Timer
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStopTimer}
                      className="timer-control stop"
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop Timer
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Timer className="h-5 w-5 mr-2 text-architect" />
          <CardTitle>Time Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Task</label>
          <Select value={selectedTaskId || ""} onValueChange={handleTaskSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {tasksByJob.map(({ job, tasks }) => (
                <div key={job.id}>
                  <div className="px-2 py-1.5 text-sm font-semibold">{job.title}</div>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTaskId && (
          <div className="space-y-4">
            <div className="text-center p-4 rounded-md bg-secondary">
              <div className="text-3xl font-mono">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isTracking ? 'Timer running' : 'Timer stopped'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {!isTracking ? (
                <Button 
                  onClick={handleStartTimer} 
                  className="w-full timer-control start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button 
                  onClick={handleStopTimer}
                  className="w-full timer-control stop"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Timer
                </Button>
              )}
              <Button variant="outline" className="w-full">
                Manual Entry
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
