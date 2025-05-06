<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminMessageReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected Message $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
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
        $jobTitle = $this->message->job->title;
        $sender = $this->message->sender->name;
        $role = $this->message->sender->roles->first()->name;

        return (new MailMessage)
            ->subject("New Message Received: {$jobTitle}")
            ->line("You have received a new message from {$sender} ({$role})")
            ->line("Job: {$jobTitle}")
            ->line("Message:")
            ->line($this->message->message)
            ->action('View Message', url('/admin/messages/' . $this->message->id))
            ->line('Please review and take appropriate action.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'message_id' => $this->message->id,
            'job_id' => $this->message->job_id,
            'sender_id' => $this->message->from_id,
            'sender_name' => $this->message->sender->name,
            'sender_role' => $this->message->sender->roles->first()->name,
            'job_title' => $this->message->job->title,
            'message_preview' => str(strip_tags($this->message->message))->limit(100),
            'needs_admin_review' => $this->message->needs_admin_review,
            'has_attachments' => $this->message->getMedia('message_attachments')->isNotEmpty()
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
        // Only send if the message needs admin review or is directly to admin
        return $this->message->needs_admin_review || 
               ($notifiable->id === $this->message->to_id && $notifiable->hasRole('admin'));
    }
}