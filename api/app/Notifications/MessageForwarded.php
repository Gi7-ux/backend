<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MessageForwarded extends Notification implements ShouldQueue
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
        $originalSenderRole = $this->message->original_sender_id ? 
            $this->message->originalSender->roles->first()->name : null;

        $mailMessage = (new MailMessage)
            ->subject("Message from Admin: {$jobTitle}")
            ->line("You have received a message from the admin regarding job: {$jobTitle}");

        if ($originalSenderRole) {
            $mailMessage->line("This message was forwarded from a {$originalSenderRole}.");
        }

        $mailMessage->line("Message:")
            ->line($this->message->message);

        if ($this->message->admin_notes) {
            $mailMessage->line("Admin Notes:")
                ->line($this->message->admin_notes);
        }

        return $mailMessage->action('View Message', url('/messages/' . $this->message->id))
            ->line('You can reply to this message through the platform, and the admin will forward it to the appropriate party.');
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
            'job_title' => $this->message->job->title,
            'admin_id' => $this->message->from_id,
            'admin_name' => $this->message->sender->name,
            'original_sender_id' => $this->message->original_sender_id,
            'original_sender_role' => $this->message->original_sender_id ? 
                $this->message->originalSender->roles->first()->name : null,
            'message_preview' => str(strip_tags($this->message->message))->limit(100),
            'has_admin_notes' => !empty($this->message->admin_notes),
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
        // Don't send to the original sender or to non-admin senders
        return $notifiable->id !== $this->message->original_sender_id &&
               $this->message->sender->hasRole('admin');
    }
}