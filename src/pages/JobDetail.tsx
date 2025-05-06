import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Calendar,
  FileEdit,
  Trash2,
  Plus,
  BarChart2,
  UserCog,
  ClipboardList,
  Clock
} from "lucide-react";

import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { JobForm } from "@/components/jobs/JobForm";
import { TasksList } from "@/components/jobs/TasksList";
import { JobTimeline } from "@/components/jobs/JobTimeline";
import { JobStatusUpdater } from "@/components/jobs/JobStatusUpdater";
import { JobReports } from "@/components/jobs/JobReports";
import { StatusUpdates } from "@/components/jobs/StatusUpdates";
import { StatusUpdatesApi } from "@/components/jobs/StatusUpdatesApi";
import { formatCurrency } from "@/lib/formatters";

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getJobById,
    updateJob,
    deleteJob,
    getTasksByJobId,
    mockUsers,
    getClientById,
    getArchitectById
  } = useData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const job = getJobById(jobId || "");
  const jobTasks = job ? getTasksByJobId(job.id) : [];
  const client = job ? getClientById(job.clientId) : undefined;
  const architect = job?.architectId ? getArchitectById(job.architectId) : undefined;

  // Filter users based on role for form dropdown
  const clients = mockUsers
    .filter(user => user.role === "client")
    .map(user => ({ id: user.id, name: user.name }));

  const architects = mockUsers
    .filter(user => user.role === "architect")
    .map(user => ({ id: user.id, name: user.name }));

  if (!job) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>Job not found</CardTitle>
            <CardDescription>
              The job you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="default" onClick={() => navigate("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleEdit = (values: any) => {
    updateJob({
      ...values,
      id: job.id,
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    deleteJob(job.id);
    navigate("/jobs");
  };

  const canEdit = currentUser?.role === "admin" ||
    (currentUser?.role === "client" && job.clientId === currentUser.id) ||
    (currentUser?.role === "architect" && job.architectId === currentUser.id && job.status === "in_progress");

  const canDelete = currentUser?.role === "admin" ||
    (currentUser?.role === "client" && job.clientId === currentUser.id && ["draft", "open"].includes(job.status));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2">
              <JobStatusBadge status={job.status} />
              {job.projectType && (
                <span className="text-sm text-muted-foreground">
                  {job.projectType}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Make changes to the project details below.
                  </DialogDescription>
                </DialogHeader>
                <JobForm
                  job={job}
                  clients={clients}
                  architects={architects}
                  onSubmit={handleEdit}
                />
              </DialogContent>
            </Dialog>
          )}

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this project
                    and all associated tasks and time entries.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {(currentUser?.role === "admin" || (currentUser?.role === "client" && job.clientId === currentUser.id)) && (
        <JobStatusUpdater job={job} updateJob={updateJob} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 max-w-3xl">
          <TabsTrigger value="details">
            <ClipboardList className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Calendar className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="people">
            <UserCog className="h-4 w-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart2 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Project Type</h3>
                  <p>{job.projectType || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p>{job.location || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Budget</h3>
                  <p>{job.budget ? formatCurrency(job.budget, job.currency || 'ZAR') : "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Deadline</h3>
                  <p>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <JobStatusBadge status={job.status} />
                </div>
              </div>

              {job.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  {jobTasks.length} {jobTasks.length === 1 ? "task" : "tasks"} for this project
                </CardDescription>
              </div>
              <Link to={`/jobs/${job.id}/tasks/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <TasksList jobId={job.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <JobTimeline jobId={job.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Client</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {client?.avatarUrl ? (
                      <img src={client.avatarUrl} alt={client.name} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="font-bold">{client?.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{client?.name || "Unknown Client"}</p>
                    <p className="text-sm text-muted-foreground">{client?.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Architect</h3>
                {architect ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {architect.avatarUrl ? (
                        <img src={architect.avatarUrl} alt={architect.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="font-bold">{architect.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{architect.name}</p>
                      <p className="text-sm text-muted-foreground">{architect.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No architect assigned yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="space-y-8">
            <JobReports jobId={job.id} />

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Status Updates</h2>
              {/* Use the API-based component when in production, and the mock data component when in development */}
              {process.env.NODE_ENV === 'production' ? (
                <StatusUpdatesApi jobId={job.id} />
              ) : (
                <StatusUpdates jobId={job.id} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetail;
