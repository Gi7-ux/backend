<?php

namespace Tests\Feature\Notifications;

use App\Jobs\RetryFailedNotification;
use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use App\Notifications\JobUpdatedByAdmin;
use App\Notifications\MessageForwarded;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Notifications\Events\NotificationFailed;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationQueueTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $client;
    protected Job $job;

    protected function setUp(): void
    {
        parent::setUp();
        
        Queue::fake();
        Mail::fake();
        Notification::fake();
        Event::fake([NotificationFailed::class]);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->client = User::factory()->create();
        $this->client->assignRole('client');

        $this->job = Job::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'open'
        ]);
    }

    /** @test */
    public function notifications_are_queued_properly()
    {
        // Update job to trigger notification
        $this->actingAs($this->admin);
        $this->job->update(['status' => 'in_progress']);

        Queue::assertPushed(function (JobUpdatedByAdmin $notification) {
            return $notification->delay === now()->addSeconds(10);
        });
    }

    /** @test */
    public function failed_notifications_are_retried()
    {
        $notification = new JobUpdatedByAdmin($this->job);

        // Simulate failed notification
        Event::dispatch(new NotificationFailed(
            $this->client,
            $notification,
            'mail',
            new Exception('Test failure')
        ));

        Queue::assertPushed(RetryFailedNotification::class, function ($job) {
            return $job->notification instanceof JobUpdatedByAdmin &&
                $job->tries === 3 &&
                $job->backoff === 60;
        });
    }

    /** @test */
    public function bulk_notifications_are_chunked()
    {
        // Create multiple users to notify
        $users = User::factory()->count(100)->create()->each(function ($user) {
            $user->assignRole('client');
        });

        $message = Message::factory()->create([
            'from_id' => $this->admin->id,
            'message_type' => 'admin_broadcast'
        ]);

        // Send bulk notification
        Notification::send($users, new MessageForwarded($message));

        // Verify notifications are chunked into smaller batches
        Queue::assertPushed(function ($job) {
            return $job->chunkSize === 25;
        });
    }

    /** @test */
    public function notification_preferences_are_respected_in_queue()
    {
        // Set user to only receive database notifications
        $this->client->notification_preferences = ['email' => false];
        $this->client->save();

        $this->actingAs($this->admin);
        $this->job->update(['status' => 'completed']);

        Queue::assertNotPushed(function ($job) {
            return $job->channels === ['mail'];
        });

        Queue::assertPushed(function ($job) {
            return $job->channels === ['database'];
        });
    }

    /** @test */
    public function rate_limiting_is_applied_to_notifications()
    {
        $this->actingAs($this->admin);

        // Attempt multiple rapid updates
        for ($i = 0; $i < 5; $i++) {
            $this->job->update(['admin_notes' => "Update {$i}"]);
        }

        // Verify rate limiting is working
        Queue::assertPushed(JobUpdatedByAdmin::class, function ($job) {
            return $job->rateLimitKey === "notifications:job:{$this->job->id}:client:{$this->client->id}";
        });

        // Only 2 notifications should be queued within the rate limit window
        Queue::assertPushedTimes(JobUpdatedByAdmin::class, 2);
    }

    /** @test */
    public function failed_notifications_are_logged()
    {
        $notification = new JobUpdatedByAdmin($this->job);
        $exception = new Exception('Test notification failure');

        Event::dispatch(new NotificationFailed(
            $this->client,
            $notification,
            'mail',
            $exception
        ));

        // Verify failure is logged with appropriate context
        $this->assertDatabaseHas('notification_failures', [
            'user_id' => $this->client->id,
            'notification_type' => get_class($notification),
            'channel' => 'mail',
            'error_message' => $exception->getMessage(),
            'attempts' => 1
        ]);
    }

    /** @test */
    public function high_priority_notifications_bypass_queue()
    {
        $this->actingAs($this->admin);
        $this->job->update([
            'status' => 'cancelled',
            'admin_notes' => 'Urgent cancellation notice'
        ]);

        // High priority notifications should be sent immediately
        Notification::assertSentTo(
            $this->client,
            JobUpdatedByAdmin::class,
            function ($notification) {
                return $notification->afterCommit === true &&
                    !$notification->delay;
            }
        );
    }

    /** @test */
    public function notifications_maintain_order_in_queue()
    {
        $this->actingAs($this->admin);

        // Create sequence of updates
        $updates = [
            'status' => 'in_progress',
            'admin_notes' => 'First update',
            'completion_percentage' => 50,
            'admin_notes' => 'Second update'
        ];

        foreach ($updates as $field => $value) {
            $this->job->update([$field => $value]);
        }

        // Verify notifications are queued in correct order
        Queue::assertPushedInOrder([
            JobUpdatedByAdmin::class,
            JobUpdatedByAdmin::class,
            JobUpdatedByAdmin::class,
            JobUpdatedByAdmin::class
        ]);
    }
}