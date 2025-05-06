<?php

namespace App\Jobs;

use App\Models\NotificationFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryFailedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60; // 1 minute initial delay
    public $maxExceptions = 3;

    protected $notifiable;
    protected $notification;
    protected $channel;
    protected $originalException;
    protected $failureId;

    /**
     * Create a new job instance.
     */
    public function __construct($notifiable, Notification $notification, string $channel, \Exception $originalException)
    {
        $this->notifiable = $notifiable;
        $this->notification = $notification;
        $this->channel = $channel;
        $this->originalException = $originalException;
        
        // Track the failure
        $this->failureId = $this->logFailure();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Attempt to resend the notification
            $this->notifiable->notify($this->notification);

            // Update success status
            NotificationFailure::find($this->failureId)->update([
                'resolved_at' => now(),
                'resolution_notes' => 'Successfully resent after retry'
            ]);

        } catch (\Exception $e) {
            $this->handleRetryFailure($e);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Exception $exception): void
    {
        Log::error('Final notification retry failed', [
            'notification' => get_class($this->notification),
            'recipient' => get_class($this->notifiable) . ':' . $this->notifiable->id,
            'original_error' => $this->originalException->getMessage(),
            'final_error' => $exception->getMessage()
        ]);

        NotificationFailure::find($this->failureId)->update([
            'final_error' => $exception->getMessage(),
            'failed_permanently_at' => now()
        ]);

        // Notify admin of permanent failure if critical
        if ($this->isCriticalNotification()) {
            $this->notifyAdminOfFailure($exception);
        }
    }

    /**
     * Calculate the number of seconds to wait before retrying.
     */
    public function backoff(): int
    {
        // Exponential backoff: 1min, 5min, 15min
        return pow(3, $this->attempts()) * $this->backoff;
    }

    /**
     * Determine if the notification should be retried.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHours(2); // Maximum retry window
    }

    /**
     * Log the initial failure.
     */
    protected function logFailure(): int
    {
        $failure = NotificationFailure::create([
            'user_id' => $this->notifiable->id,
            'notification_type' => get_class($this->notification),
            'channel' => $this->channel,
            'error_message' => $this->originalException->getMessage(),
            'notification_data' => [
                'class' => get_class($this->notification),
                'content' => method_exists($this->notification, 'toArray') 
                    ? $this->notification->toArray($this->notifiable)
                    : null
            ],
            'attempts' => 1,
            'created_at' => now()
        ]);

        return $failure->id;
    }

    /**
     * Handle a retry failure.
     */
    protected function handleRetryFailure(\Exception $e): void
    {
        $failure = NotificationFailure::find($this->failureId);
        $failure->update([
            'attempts' => $failure->attempts + 1,
            'last_error' => $e->getMessage(),
            'last_attempt_at' => now()
        ]);

        if ($this->attempts() >= $this->tries) {
            $this->failed($e);
        } else {
            // Will be retried automatically by Laravel's job system
            throw $e;
        }
    }

    /**
     * Determine if this is a critical notification that requires admin attention.
     */
    protected function isCriticalNotification(): bool
    {
        return in_array(get_class($this->notification), [
            'App\Notifications\JobUpdatedByAdmin',
            'App\Notifications\PaymentFailed',
            'App\Notifications\SecurityAlert'
        ]);
    }

    /**
     * Notify admin of permanent failure for critical notifications.
     */
    protected function notifyAdminOfFailure(\Exception $exception): void
    {
        // Get admin users
        $admins = \App\Models\User::role('admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\CriticalNotificationFailed(
                $this->notification,
                $this->notifiable,
                $this->originalException,
                $exception
            ));
        }
    }
}