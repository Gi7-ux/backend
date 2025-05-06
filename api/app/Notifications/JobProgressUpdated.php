<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobProgressUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected Job $job;

    /**
     * Create a new notification instance.
     */
    public function __construct(Job $job)
    {
        $this->job = $job;
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
        return (new MailMessage)
            ->subject("Job Progress Update: {$this->job->title}")
            ->line("The freelancer has updated progress on job: {$this->job->title}")
            ->line("Current completion: {$this->job->completion_percentage}%")
            ->line("Progress Notes:")
            ->line($this->job->progress_notes)
            ->action('Review Progress', url("/admin/jobs/{$this->job->id}"))
            ->line('Please review and contact the freelancer if you need any clarification.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'job_id' => $this->job->id,
            'job_title' => $this->job->title,
            'freelancer_id' => $this->job->freelancer_id,
            'freelancer_name' => $this->job->freelancer->name,
            'completion_percentage' => $this->job->completion_percentage,
            'progress_notes' => $this->job->progress_notes,
            'previous_completion' => $this->job->getOriginal('completion_percentage'),
            'updated_at' => $this->job->updated_at
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
        // Only send to admin users
        return $notifiable->hasRole('admin') && 
               // Only if there's been a significant change in progress (>5%)
               abs($this->job->completion_percentage - $this->job->getOriginal('completion_percentage')) >= 5;
    }
}