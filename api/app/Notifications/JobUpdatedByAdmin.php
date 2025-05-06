<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobUpdatedByAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    protected Job $job;
    protected array $changes;
    protected ?string $adminMessage;

    /**
     * Create a new notification instance.
     */
    public function __construct(Job $job, ?string $adminMessage = null)
    {
        $this->job = $job;
        $this->changes = $job->getDirty();
        $this->adminMessage = $adminMessage;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<string>
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject("Job Update from Admin: {$this->job->title}")
            ->line("An administrator has made changes to the job: {$this->job->title}");

        // Add admin message if provided
        if ($this->adminMessage) {
            $mailMessage->line("Admin Message:")
                ->line($this->adminMessage);
        }

        // Add details about what changed in a user-friendly format
        foreach ($this->changes as $field => $newValue) {
            $oldValue = $this->job->getOriginal($field);
            
            if (is_array($newValue)) {
                $oldValue = json_encode($oldValue);
                $newValue = json_encode($newValue);
            }

            // Special handling for status changes
            if ($field === 'status') {
                $mailMessage->line("Job status has been changed from {$oldValue} to {$newValue}");
                if ($newValue === 'completed') {
                    $mailMessage->line("Please review the completion and submit any feedback.");
                } elseif ($newValue === 'in_progress') {
                    $mailMessage->line("Work can now begin on this job.");
                }
                continue;
            }

            $mailMessage->line("Updated {$field}:")
                ->line("From: {$oldValue}")
                ->line("To: {$newValue}");
        }

        return $mailMessage
            ->action('View Job Details', url("/jobs/{$this->job->id}"))
            ->line('Please review these changes and contact support if you have any questions.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        $changes = [];
        foreach ($this->changes as $field => $newValue) {
            $changes[$field] = [
                'old' => $this->job->getOriginal($field),
                'new' => $newValue
            ];
        }

        return [
            'job_id' => $this->job->id,
            'job_title' => $this->job->title,
            'admin_message' => $this->adminMessage,
            'changes' => $changes,
            'updated_at' => $this->job->updated_at,
            'status' => $this->job->status,
            'requires_action' => in_array($this->job->status, ['completed', 'cancelled']),
            'can_start_work' => $this->job->status === 'in_progress'
        ];
    }

    /**
     * Determine if the notification should be sent.
     *
     * @param mixed $notifiable
     * @return bool
     */
    public function shouldSend($notifiable): bool
    {
        // Only send if there are actual changes and recipient is the client or assigned freelancer
        return !empty($this->changes) && 
               ($notifiable->id === $this->job->client_id || 
                $notifiable->id === $this->job->freelancer_id);
    }
}