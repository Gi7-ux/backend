<?php

namespace Tests\Feature\Notifications;

use App\Models\Job;
use App\Models\User;
use App\Notifications\JobProgressUpdated;
use App\Notifications\JobDetailsUpdated;
use App\Notifications\JobUpdatedByAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class JobUpdateNotificationsTest extends TestCase
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
    public function it_notifies_admin_when_freelancer_updates_progress()
    {
        $this->job->update([
            'progress_notes' => 'Making good progress',
            'completion_percentage' => 50
        ]);

        Notification::assertSentTo(
            $this->admin,
            JobProgressUpdated::class,
            function ($notification) {
                return $notification->job->id === $this->job->id &&
                    $notification->job->completion_percentage === 50;
            }
        );
    }

    /** @test */
    public function it_does_not_notify_admin_for_small_progress_updates()
    {
        $this->job->update([
            'progress_notes' => 'Minor update',
            'completion_percentage' => 52 // Less than 5% change
        ]);

        Notification::assertNotSentTo($this->admin, JobProgressUpdated::class);
    }

    /** @test */
    public function it_notifies_admin_when_client_updates_job_details()
    {
        $originalBudget = $this->job->budget;
        $this->job->update([
            'title' => 'Updated Title',
            'budget' => $originalBudget + 100
        ]);

        Notification::assertSentTo(
            $this->admin,
            JobDetailsUpdated::class,
            function ($notification) {
                return $notification->job->id === $this->job->id &&
                    array_key_exists('title', $notification->changes) &&
                    array_key_exists('budget', $notification->changes);
            }
        );
    }

    /** @test */
    public function it_notifies_relevant_parties_when_admin_updates_job()
    {
        $message = 'Important update from admin';
        $this->job->update([
            'status' => 'completed',
            'admin_notes' => $message
        ]);

        Notification::assertSentTo(
            [$this->client, $this->freelancer],
            JobUpdatedByAdmin::class,
            function ($notification) use ($message) {
                return $notification->job->id === $this->job->id &&
                    $notification->adminMessage === $message &&
                    array_key_exists('status', $notification->changes);
            }
        );
    }

    /** @test */
    public function it_includes_appropriate_action_flags_for_status_changes()
    {
        $this->job->update(['status' => 'completed']);

        Notification::assertSentTo(
            $this->client,
            JobUpdatedByAdmin::class,
            function ($notification) {
                $data = $notification->toArray($this->client);
                return $data['requires_action'] === true &&
                    $data['status'] === 'completed';
            }
        );
    }

    /** @test */
    public function it_handles_array_field_changes_correctly()
    {
        $originalSkills = $this->job->skills_required;
        $newSkills = array_merge($originalSkills, ['new_skill']);
        
        $this->job->update(['skills_required' => $newSkills]);

        Notification::assertSentTo(
            $this->admin,
            JobDetailsUpdated::class,
            function ($notification) use ($originalSkills, $newSkills) {
                $data = $notification->toArray($this->admin);
                return isset($data['changes']['skills_required']) &&
                    $data['changes']['skills_required']['old'] === $originalSkills &&
                    $data['changes']['skills_required']['new'] === $newSkills;
            }
        );
    }

    /** @test */
    public function it_respects_notification_routing_rules()
    {
        // Admin updates should not notify admin
        $this->actingAs($this->admin);
        $this->job->update(['status' => 'in_progress']);
        Notification::assertNotSentTo($this->admin, JobUpdatedByAdmin::class);

        // Client updates in non-open status should be blocked
        $this->actingAs($this->client);
        $this->job->update(['title' => 'New Title']);
        Notification::assertNotSentTo($this->admin, JobDetailsUpdated::class);

        // Freelancer updates should only go to admin
        $this->actingAs($this->freelancer);
        $this->job->update(['completion_percentage' => 75]);
        Notification::assertSentTo($this->admin, JobProgressUpdated::class);
        Notification::assertNotSentTo($this->client, JobProgressUpdated::class);
    }
}