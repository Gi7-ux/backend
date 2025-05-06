<?php

namespace App\Notifications;

use App\Models\StatusUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewStatusUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The status update instance.
     *
     * @var \App\Models\StatusUpdate
     */
    protected $statusUpdate;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\StatusUpdate $statusUpdate
     * @return void
     */
    public function __construct(StatusUpdate $statusUpdate)
    {
        $this->statusUpdate = $statusUpdate;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $job = $this->statusUpdate->job;
        $architect = $this->statusUpdate->user;

        return (new MailMessage)
            ->subject('New Status Update for Job: ' . $job->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new status update has been submitted for job: ' . $job->title)
            ->line('From: ' . $architect->name)
            ->line('Update: ' . $this->statusUpdate->content)
            ->action('View Status Update', url('/jobs/' . $job->id))
            ->line('Thank you for using Architex!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $job = $this->statusUpdate->job;
        $architect = $this->statusUpdate->user;

        return [
            'status_update_id' => $this->statusUpdate->id,
            'job_id' => $job->id,
            'job_title' => $job->title,
            'architect_id' => $architect->id,
            'architect_name' => $architect->name,
            'content' => $this->statusUpdate->content,
            'created_at' => $this->statusUpdate->created_at,
        ];
    }
}
