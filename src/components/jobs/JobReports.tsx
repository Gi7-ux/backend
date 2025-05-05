
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { formatMinutesToHours, formatCurrency } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { StatusUpdates } from "./StatusUpdates";

interface JobReportsProps {
  jobId: string;
}

export const JobReports: React.FC<JobReportsProps> = ({ jobId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { 
    getJobById, 
    getJobReports,
    addJobReport,
    getTotalTimeForJob,
    getTasksByJobId,
    getTotalTimeForTask,
    getArchitectById
  } = useData();
  
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  const job = getJobById(jobId);
  const reports = getJobReports(jobId);
  const totalMinutes = getTotalTimeForJob(jobId);
  const tasks = getTasksByJobId(jobId);
  
  if (!job) return null;
  
  // Calculate cost based on time spent if architect has hourly rate
  const calculateCost = () => {
    if (!job.architectId) return 0;
    
    const architect = getArchitectById(job.architectId);
    if (!architect || !architect.hourlyRate) return 0;
    
    // Convert minutes to hours and multiply by rate
    const hours = totalMinutes / 60;
    return hours * (architect.hourlyRate || 0);
  };
  
  const estimatedCost = calculateCost();
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  const handleGenerateReport = () => {
    addJobReport({
      jobId,
      timeSpent: totalMinutes,
      costToDate: estimatedCost,
      completionPercentage,
      notes: notes,
    });
    
    toast({
      title: "Report Generated",
      description: "A new project report has been generated.",
    });
    
    setNotes("");
    setDialogOpen(false);
  };
  
  const canGenerateReports = currentUser?.role === "admin" || currentUser?.role === "architect";
  
  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="summary">Project Summary</TabsTrigger>
          <TabsTrigger value="updates">Status Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Summary</CardTitle>
              {canGenerateReports && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Generate Report</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Project Report</DialogTitle>
                      <DialogDescription>
                        Create a new progress report for this project.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Time Spent</h4>
                        <p>{formatMinutesToHours(totalMinutes)}</p>
                      </div>
                      
                      {estimatedCost > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">Cost to Date</h4>
                          <p>{formatCurrency(estimatedCost, job.currency || 'ZAR')}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold mb-1">Completion</h4>
                        <p>{completionPercentage.toFixed(0)}%</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-semibold mb-1">Notes</h4>
                        <Textarea
                          placeholder="Add notes to this report..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button onClick={handleGenerateReport}>Generate Report</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">
                      {formatMinutesToHours(totalMinutes)}
                    </div>
                    <p className="text-muted-foreground text-sm">Total Time Spent</p>
                  </CardContent>
                </Card>
                
                {estimatedCost > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold mb-1">
                        {formatCurrency(estimatedCost, job.currency || 'ZAR')}
                      </div>
                      <p className="text-muted-foreground text-sm">Cost to Date</p>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">
                      {completionPercentage.toFixed(0)}%
                    </div>
                    <p className="text-muted-foreground text-sm">Project Completion</p>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="font-medium mb-4">Tasks Breakdown</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell className="capitalize">{task.status.replace('_', ' ')}</TableCell>
                        <TableCell>{formatMinutesToHours(getTotalTimeForTask(task.id))}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No tasks created yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {reports.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Previous Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <Card key={report.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Report #{reports.length - index}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Time Spent</p>
                            <p>{formatMinutesToHours(report.timeSpent)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cost to Date</p>
                            <p>{formatCurrency(report.costToDate, job.currency || 'ZAR')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completion</p>
                            <p>{report.completionPercentage.toFixed(0)}%</p>
                          </div>
                        </div>
                        
                        {report.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Notes</p>
                            <p className="bg-muted/30 p-3 rounded-md text-sm">{report.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="updates">
          <StatusUpdates jobId={jobId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
