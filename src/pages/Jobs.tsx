
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { JobStatus, CURRENCIES, PROJECT_TYPES } from "@/types";
import { Plus, Search, BarChart2 } from "lucide-react";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { formatCurrency } from "@/lib/formatters";

const Jobs = () => {
  const { currentUser } = useAuth();
  const { jobs } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all");

  // Filter jobs based on user role
  const filteredJobs = jobs.filter(job => {
    // Role-based filtering
    if (currentUser?.role === "client") {
      if (job.clientId !== currentUser.id) return false;
    } else if (currentUser?.role === "architect") {
      if (job.architectId !== currentUser.id) return false;
    }
    
    // Search term filtering
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filtering
    if (statusFilter !== "all" && job.status !== statusFilter) {
      return false;
    }

    // Project type filtering
    if (projectTypeFilter !== "all" && job.projectType !== projectTypeFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {currentUser?.role === "client" ? "My Projects" : 
             currentUser?.role === "architect" ? "My Jobs" : "All Jobs"}
          </h2>
          <p className="text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>
        </div>
        
        {currentUser?.role === "client" && (
          <Link to="/jobs/new">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        )}
        
        {currentUser?.role === "admin" && (
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link to="/jobs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </Link>
            <Link to="/job-reports">
              <Button variant="outline">
                <BarChart2 className="h-4 w-4 mr-2" />
                Job Reports
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={projectTypeFilter}
          onValueChange={setProjectTypeFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Project Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Project Types</SelectItem>
            {PROJECT_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <JobStatusBadge status={job.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {job.description}
                </p>
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  {job.deadline && (
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p>{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                  {job.budget && (
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p>{formatCurrency(job.budget, job.currency || 'ZAR')}</p>
                    </div>
                  )}
                </div>
                
                {job.projectType && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {job.projectType}
                    </Badge>
                    {job.location && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {job.location}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || statusFilter !== "all" || projectTypeFilter !== "all"
              ? "Try adjusting your filters"
              : currentUser?.role === "client" 
                ? "Create your first project to get started" 
                : "No jobs available right now"}
          </p>
          
          {currentUser?.role === "client" && (
            <Link to="/jobs/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create a Project
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
