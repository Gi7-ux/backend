
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, Users, CheckCircle, BarChart3 } from "lucide-react";

const StatCard = ({ title, value, icon, className }: { 
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <Card className={`overflow-hidden ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-architect-light/30 to-transparent">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <div className="bg-architect rounded-full p-2 text-white">
        {icon}
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { jobs, tasks, timeEntries } = useData();
  
  // Calculate statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => ["assigned", "in_progress", "review"].includes(job.status)).length;
  const completedJobs = jobs.filter(job => job.status === "completed").length;
  const totalHours = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0) / 60;
  
  const stats = [
    { title: "Total Projects", value: totalJobs, icon: <Briefcase className="h-5 w-5" /> },
    { title: "Active Projects", value: activeJobs, icon: <Clock className="h-5 w-5" /> },
    { title: "Completed Projects", value: completedJobs, icon: <CheckCircle className="h-5 w-5" /> },
    { title: "Total Hours Logged", value: totalHours.toFixed(1), icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-br from-architect-light/30 to-transparent">
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest jobs in the system</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {jobs.slice(0, 3).map(job => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">Status: {job.status.replace('_', ' ')}</div>
                  </div>
                  <div className="text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-br from-architect-light/30 to-transparent">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the team</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {tasks.filter(task => task.status === "completed").slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">Task completed</div>
                  </div>
                  <div className="text-sm">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ArchitectDashboard = () => {
  const { currentUser } = useAuth();
  const { jobs, tasks, timeEntries } = useData();
  
  // Filter jobs assigned to this architect
  const myJobs = jobs.filter(job => job.architectId === currentUser?.id);
  
  // Calculate statistics
  const activeJobs = myJobs.filter(job => ["assigned", "in_progress", "review"].includes(job.status)).length;
  const completedJobs = myJobs.filter(job => job.status === "completed").length;
  
  // Filter tasks assigned to this architect
  const myTasks = tasks.filter(task => task.assignedTo === currentUser?.id);
  const pendingTasks = myTasks.filter(task => task.status !== "completed").length;
  
  // Calculate total hours logged by this architect
  const myTimeEntries = timeEntries.filter(entry => entry.architectId === currentUser?.id);
  const totalHours = myTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0) / 60;
  
  const stats = [
    { title: "Active Projects", value: activeJobs, icon: <Briefcase className="h-5 w-5" /> },
    { title: "Completed Projects", value: completedJobs, icon: <CheckCircle className="h-5 w-5" /> },
    { title: "Pending Tasks", value: pendingTasks, icon: <Clock className="h-5 w-5" /> },
    { title: "Hours Logged", value: totalHours.toFixed(1), icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Architect Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-br from-architect-light/30 to-transparent">
            <CardTitle>My Current Jobs</CardTitle>
            <CardDescription>Projects you're working on</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {myJobs.filter(job => job.status !== "completed").slice(0, 4).map(job => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">Status: {job.status.replace('_', ' ')}</div>
                  </div>
                  <div className="text-sm">
                    Due: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>
              ))}
              {myJobs.filter(job => job.status !== "completed").length === 0 && (
                <p className="text-sm text-muted-foreground">No active jobs assigned to you.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-br from-architect-light/30 to-transparent">
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {myTasks.filter(task => task.status !== "completed").slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">Status: {task.status.replace('_', ' ')}</div>
                  </div>
                  <div className="text-sm">
                    {task.estimatedHours ? `Est. ${task.estimatedHours}h` : 'No estimate'}
                  </div>
                </div>
              ))}
              {myTasks.filter(task => task.status !== "completed").length === 0 && (
                <p className="text-sm text-muted-foreground">No pending tasks assigned to you.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const { jobs } = useData();
  
  // Filter jobs belonging to this client
  const myJobs = jobs.filter(job => job.clientId === currentUser?.id);
  
  // Calculate statistics
  const totalJobs = myJobs.length;
  const activeJobs = myJobs.filter(job => ["assigned", "in_progress", "review"].includes(job.status)).length;
  const completedJobs = myJobs.filter(job => job.status === "completed").length;
  const draftJobs = myJobs.filter(job => job.status === "draft").length;
  
  const stats = [
    { title: "Total Projects", value: totalJobs, icon: <Briefcase className="h-5 w-5" /> },
    { title: "Active Projects", value: activeJobs, icon: <Clock className="h-5 w-5" /> },
    { title: "Completed Projects", value: completedJobs, icon: <CheckCircle className="h-5 w-5" /> },
    { title: "Draft Projects", value: draftJobs, icon: <Briefcase className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Client Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <Card>
        <CardHeader className="bg-gradient-to-br from-architect-light/30 to-transparent">
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Overview of all your projects</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {myJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-muted-foreground">Status: {job.status.replace('_', ' ')}</div>
                </div>
                <div className="text-sm">
                  {job.deadline ? `Due: ${new Date(job.deadline).toLocaleDateString()}` : 'No deadline'}
                </div>
              </div>
            ))}
            {myJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">You don't have any projects yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto blueprint-bg min-h-[calc(100vh-3.5rem)]">
      {currentUser.role === "admin" && <AdminDashboard />}
      {currentUser.role === "architect" && <ArchitectDashboard />}
      {currentUser.role === "client" && <ClientDashboard />}
    </div>
  );
}

export default Dashboard;
