<?php

namespace App\Notifications;

use App\Models\AdminComment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAdminCommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The admin comment instance.
     *
     * @var \App\Models\AdminComment
     */
    protected $adminComment;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\AdminComment $adminComment
     * @return void
     */
    public function __construct(AdminComment $adminComment)
    {
        $this->adminComment = $adminComment;
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
        $statusUpdate = $this->adminComment->statusUpdate;
        $job = $statusUpdate->job;
        $admin = $this->adminComment->admin;

        return (new MailMessage)
            ->subject('Admin Response to Your Status Update')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('An admin has responded to your status update for job: ' . $job->title)
            ->line('From: ' . $admin->name)
            ->line('Comment: ' . $this->adminComment->content)
            ->action('View Comment', url('/jobs/' . $job->id))
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
        $statusUpdate = $this->adminComment->statusUpdate;
        $job = $statusUpdate->job;
        $admin = $this->adminComment->admin;

        return [
            'admin_comment_id' => $this->adminComment->id,
            'status_update_id' => $statusUpdate->id,
            'job_id' => $job->id,
            'job_title' => $job->title,
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'content' => $this->adminComment->content,
            'created_at' => $this->adminComment->created_at,
        ];
    }
}
