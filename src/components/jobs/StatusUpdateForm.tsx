
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

interface StatusUpdateFormProps {
  jobId: string;
}

export const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({ jobId }) => {
  const { currentUser } = useAuth();
  const { addStatusUpdate, getJobById } = useData();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const job = getJobById(jobId);
  
  // Only architects assigned to this job can submit status updates
  if (currentUser?.role !== "architect" || job?.architectId !== currentUser.id) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Status update cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addStatusUpdate({
        jobId,
        architectId: currentUser.id,
        content: content.trim()
      });
      
      setContent("");
      toast({
        title: "Success",
        description: "Status update submitted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit status update",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Submit Status Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Provide details about your progress, challenges, or any important updates..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Update"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
