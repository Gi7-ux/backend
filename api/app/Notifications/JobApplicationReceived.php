<?php

namespace App\Notifications;

use App\Models\Job;
use App\Models\User;
use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobApplicationReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected $job;
    protected $freelancer;
    protected $application;

    /**
     * Create a new notification instance.
     *
     * @param  Job  $job
     * @param  User  $freelancer
     * @param  JobApplication  $application
     */
    public function __construct(Job $job, User $freelancer, JobApplication $application)
    {
        $this->job = $job;
        $this->freelancer = $freelancer;
        $this->application = $application;
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
            ->subject("New Application Received for {$this->job->title}")
            ->greeting("Hello {$this->job->client->name}!")
            ->line("You have received a new application for your job '{$this->job->title}'.")
            ->line("Applicant: {$this->freelancer->name}")
            ->line("Proposed Rate: $" . number_format($this->application->proposed_rate, 2))
            ->line("Cover Letter:")
            ->line($this->application->cover_letter)
            ->action('Review Application', url("/jobs/{$this->job->id}/applications"))
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
            'freelancer_id' => $this->freelancer->id,
            'freelancer_name' => $this->freelancer->name,
            'application_id' => $this->application->id,
            'proposed_rate' => $this->application->proposed_rate,
            'type' => 'job_application_received'
        ];
    }
}