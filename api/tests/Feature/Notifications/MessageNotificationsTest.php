<?php

namespace Tests\Feature\Notifications;

use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use App\Notifications\AdminMessageReceived;
use App\Notifications\MessageForwarded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MessageNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $client;
    protected User $freelancer;
    protected Job $job;
    protected Message $message;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->client = User::factory()->create();
        $this->client->assignRole('client');

        $this->freelancer = User::factory()->create();
        $this->freelancer->assignRole('freelancer');

        $this->job = Job::factory()->create([
            'client_id' => $this->client->id,
            'freelancer_id' => $this->freelancer->id,
            'status' => 'in_progress'
        ]);

        $this->message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->admin->id,
            'message' => 'Test message content',
            'message_type' => 'client_admin'
        ]);
    }

    /** @test */
    public function it_notifies_admin_when_receiving_client_message()
    {
        $message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->admin->id,
            'message' => 'Important client query',
            'message_type' => 'client_admin'
        ]);

        Notification::assertSentTo(
            $this->admin,
            AdminMessageReceived::class,
            function ($notification) use ($message) {
                return $notification->message->id === $message->id &&
                    $notification->message->message_type === 'client_admin';
            }
        );
    }

    /** @test */
    public function it_notifies_admin_when_receiving_freelancer_message()
    {
        $message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->freelancer->id,
            'to_id' => $this->admin->id,
            'message' => 'Progress update query',
            'message_type' => 'freelancer_admin'
        ]);

        Notification::assertSentTo(
            $this->admin,
            AdminMessageReceived::class,
            function ($notification) use ($message) {
                $data = $notification->toArray($this->admin);
                return $data['message_id'] === $message->id &&
                    $data['sender_type'] === 'freelancer';
            }
        );
    }

    /** @test */
    public function it_forwards_messages_with_proper_context()
    {
        $adminMessage = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->admin->id,
            'to_id' => $this->freelancer->id,
            'original_sender_id' => $this->client->id,
            'message' => 'Forwarded client query',
            'admin_notes' => 'Please address this ASAP',
            'message_type' => 'admin_forward'
        ]);

        Notification::assertSentTo(
            $this->freelancer,
            MessageForwarded::class,
            function ($notification) use ($adminMessage) {
                $data = $notification->toArray($this->freelancer);
                return $data['message_id'] === $adminMessage->id &&
                    $data['original_sender_role'] === 'client' &&
                    $data['has_admin_notes'] === true;
            }
        );
    }

    /** @test */
    public function it_prevents_direct_communication_between_client_and_freelancer()
    {
        $message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->freelancer->id,
            'message' => 'Direct message attempt',
            'message_type' => 'direct'
        ]);

        Notification::assertNotSentTo($this->freelancer, MessageForwarded::class);
        Notification::assertSentTo($this->admin, AdminMessageReceived::class);
    }

    /** @test */
    public function it_includes_attachments_in_forwarded_messages()
    {
        $adminMessage = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->admin->id,
            'to_id' => $this->client->id,
            'message' => 'Message with attachment',
            'message_type' => 'admin_forward'
        ]);

        // Simulate attachment
        $adminMessage->addMediaFromString('test file content')
            ->usingName('test.pdf')
            ->toMediaCollection('message_attachments');

        Notification::assertSentTo(
            $this->client,
            MessageForwarded::class,
            function ($notification) use ($adminMessage) {
                $data = $notification->toArray($this->client);
                return $data['message_id'] === $adminMessage->id &&
                    $data['has_attachments'] === true;
            }
        );
    }

    /** @test */
    public function it_respects_notification_preferences()
    {
        // Simulate user turning off email notifications
        $this->admin->notification_preferences = ['email' => false];
        $this->admin->save();

        $message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->admin->id,
            'message' => 'Test notification preferences',
            'message_type' => 'client_admin'
        ]);

        $notification = new AdminMessageReceived($message);
        $channels = $notification->via($this->admin);

        $this->assertNotContains('mail', $channels);
        $this->assertContains('database', $channels);
    }

    /** @test */
    public function it_generates_proper_email_subjects()
    {
        $message = Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->admin->id,
            'message' => 'Test email subjects',
            'message_type' => 'client_admin'
        ]);

        $notification = new AdminMessageReceived($message);
        $mail = $notification->toMail($this->admin);

        $this->assertStringContains("New Message: {$this->job->title}", $mail->subject);
        $this->assertStringContains('client', $mail->subject);
    }
}