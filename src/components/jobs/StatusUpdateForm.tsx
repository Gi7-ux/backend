
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useApiData } from "@/contexts/ApiDataContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

interface StatusUpdateFormProps {
  jobId: string;
}

export const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({ jobId }) => {
  const { currentUser } = useAuth();
  const { getJobById } = useData();
  const { addStatusUpdate, fetchStatusUpdates } = useApiData();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = getJobById(jobId);

  // Only architects assigned to this job can submit status updates
  if (currentUser?.role !== "architect" || job?.architectId !== currentUser.id) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      await addStatusUpdate({
        jobId,
        architectId: currentUser.id,
        content: content.trim()
      });

      // Refresh the status updates list
      await fetchStatusUpdates(jobId);

      setContent("");
    } catch (error) {
      console.error('Error submitting status update:', error);
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
