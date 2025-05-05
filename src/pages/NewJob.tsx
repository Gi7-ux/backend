
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/JobForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const NewJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addJob, mockUsers } = useData();

  // Filter users based on role
  const clients = mockUsers
    .filter(user => user.role === "client")
    .map(user => ({ id: user.id, name: user.name }));

  const architects = mockUsers
    .filter(user => user.role === "architect")
    .map(user => ({ id: user.id, name: user.name }));

  const handleSubmit = (values: any) => {
    // Convert budget from string to number if it exists
    const budget = values.budget ? parseFloat(values.budget) : undefined;
    
    const newJob = addJob({
      ...values,
      budget,
      clientId: values.clientId || (currentUser?.role === "client" ? currentUser.id : ""),
    });
    
    toast({
      title: "Success",
      description: "Project created successfully"
    });
    
    // Navigate to the job detail page
    navigate(`/jobs/${newJob.id}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Project</CardTitle>
          <CardDescription>Fill out the details to create a new architectural project</CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm 
            clients={clients}
            architects={architects}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewJob;
