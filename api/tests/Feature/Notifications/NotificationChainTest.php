<?php

namespace Tests\Feature\Notifications;

use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use App\Notifications\JobDetailsUpdated;
use App\Notifications\JobProgressUpdated;
use App\Notifications\JobUpdatedByAdmin;
use App\Notifications\AdminMessageReceived;
use App\Notifications\MessageForwarded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationChainTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $client;
    protected User $freelancer;
    protected Job $job;

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
    }

    /** @test */
    public function job_update_to_completion_notification_chain()
    {
        // 1. Freelancer updates progress
        $this->actingAs($this->freelancer);
        $this->job->update([
            'completion_percentage' => 100,
            'progress_notes' => 'Work is complete and ready for review'
        ]);

        Notification::assertSentTo(
            $this->admin,
            JobProgressUpdated::class
        );

        // 2. Admin reviews and requests changes
        $this->actingAs($this->admin);
        $adminMessage = 'Please make following adjustments...';
        $this->job->update([
            'admin_notes' => $adminMessage,
            'requires_changes' => true
        ]);

        Notification::assertSentTo(
            $this->freelancer,
            JobUpdatedByAdmin::class,
            function ($notification) use ($adminMessage) {
                return str_contains($notification->adminMessage, $adminMessage);
            }
        );

        // 3. Freelancer makes changes and updates again
        $this->actingAs($this->freelancer);
        $this->job->update([
            'completion_percentage' => 100,
            'progress_notes' => 'Adjustments completed',
            'requires_changes' => false
        ]);

        Notification::assertSentTo(
            $this->admin,
            JobProgressUpdated::class,
            function ($notification) {
                return $notification->job->requires_changes === false;
            }
        );
    }

    /** @test */
    public function client_change_request_notification_chain()
    {
        // 1. Client requests changes
        $this->actingAs($this->client);
        $changeRequest = 'Please adjust the deliverables...';
        $this->job->update([
            'client_change_requests' => $changeRequest,
            'requires_admin_review' => true
        ]);

        Notification::assertSentTo(
            $this->admin,
            JobDetailsUpdated::class,
            function ($notification) use ($changeRequest) {
                return $notification->changes['client_change_requests']['new'] === $changeRequest;
            }
        );

        // 2. Admin reviews and forwards to freelancer
        $this->actingAs($this->admin);
        $adminNote = 'Please address client concerns...';
        Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->admin->id,
            'to_id' => $this->freelancer->id,
            'message' => $changeRequest,
            'admin_notes' => $adminNote,
            'message_type' => 'admin_forward',
            'original_sender_id' => $this->client->id
        ]);

        Notification::assertSentTo(
            $this->freelancer,
            MessageForwarded::class,
            function ($notification) use ($adminNote) {
                return str_contains($notification->message->admin_notes, $adminNote);
            }
        );

        // 3. Freelancer acknowledges
        $this->actingAs($this->freelancer);
        Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->freelancer->id,
            'to_id' => $this->admin->id,
            'message' => 'Will address these changes right away',
            'message_type' => 'freelancer_admin'
        ]);

        Notification::assertSentTo(
            $this->admin,
            AdminMessageReceived::class,
            function ($notification) {
                return $notification->message->message_type === 'freelancer_admin';
            }
        );
    }

    /** @test */
    public function admin_mediated_dispute_notification_chain()
    {
        // 1. Client raises concern
        $this->actingAs($this->client);
        $concern = 'Deliverables do not match requirements...';
        Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->client->id,
            'to_id' => $this->admin->id,
            'message' => $concern,
            'message_type' => 'client_admin',
            'requires_action' => true
        ]);

        Notification::assertSentTo(
            $this->admin,
            AdminMessageReceived::class,
            function ($notification) {
                return $notification->message->requires_action === true;
            }
        );

        // 2. Admin investigates and updates job
        $this->actingAs($this->admin);
        $this->job->update([
            'status' => 'in_review',
            'admin_notes' => 'Investigating delivery concerns...',
            'requires_admin_review' => true
        ]);

        Notification::assertSentTo(
            [$this->client, $this->freelancer],
            JobUpdatedByAdmin::class,
            function ($notification) {
                return $notification->changes['status']['new'] === 'in_review';
            }
        );

        // 3. Resolution message to both parties
        $resolution = 'After review, the following steps are required...';
        Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->admin->id,
            'to_id' => $this->client->id,
            'message' => $resolution,
            'message_type' => 'admin_client'
        ]);

        Message::create([
            'job_id' => $this->job->id,
            'from_id' => $this->admin->id,
            'to_id' => $this->freelancer->id,
            'message' => $resolution,
            'message_type' => 'admin_freelancer'
        ]);

        Notification::assertSentTo(
            [$this->client, $this->freelancer],
            MessageForwarded::class,
            function ($notification) use ($resolution) {
                return str_contains($notification->message->message, $resolution);
            }
        );
    }
}