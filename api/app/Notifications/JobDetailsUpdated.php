<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobDetailsUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected Job $job;
    protected array $changes;

    /**
     * Create a new notification instance.
     */
    public function __construct(Job $job)
    {
        $this->job = $job;
        $this->changes = $job->getDirty();
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
            ->subject("Job Details Updated: {$this->job->title}")
            ->line("The client has updated details for job: {$this->job->title}");

        // Add details about what changed
        foreach ($this->changes as $field => $newValue) {
            $oldValue = $this->job->getOriginal($field);
            
            if (is_array($newValue)) {
                $oldValue = json_encode($oldValue);
                $newValue = json_encode($newValue);
            }

            $mailMessage->line("Changed {$field}:");
            $mailMessage->line("From: {$oldValue}");
            $mailMessage->line("To: {$newValue}");
        }

        return $mailMessage
            ->action('Review Changes', url("/admin/jobs/{$this->job->id}"))
            ->line('Please review the changes and take appropriate action if needed.');
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
            'client_id' => $this->job->client_id,
            'client_name' => $this->job->client->name,
            'changes' => $changes,
            'updated_at' => $this->job->updated_at,
            'needs_review' => true
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
        // Only send if there are actual changes and recipient is an admin
        return !empty($this->changes) && $notifiable->hasRole('admin');
    }
}