<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    protected $job;

    /**
     * Create a new notification instance.
     *
     * @param  Job  $job
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
    public function via(): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("You've Been Assigned to {$this->job->title}")
            ->greeting("Congratulations {$this->job->freelancer->name}!")
            ->line("You have been assigned to the job '{$this->job->title}'.")
            ->line("Project Details:")
            ->line("- Budget: $" . number_format($this->job->budget, 2))
            ->line("- Hourly Rate: $" . number_format($this->job->hourly_rate, 2))
            ->line("- Deadline: " . $this->job->deadline->format('F j, Y'))
            ->line("- Client: {$this->job->client->name}")
            ->action('View Job Details', url("/jobs/{$this->job->id}"))
            ->line('Please review the job details and begin work as soon as possible.')
            ->line('Thank you for using our platform!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'job_id' => $this->job->id,
            'job_title' => $this->job->title,
            'client_id' => $this->job->client_id,
            'client_name' => $this->job->client->name,
            'budget' => $this->job->budget,
            'hourly_rate' => $this->job->hourly_rate,
            'deadline' => $this->job->deadline,
            'type' => 'job_assigned'
        ];
    }
}