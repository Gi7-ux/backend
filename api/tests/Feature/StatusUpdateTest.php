<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use App\Models\StatusUpdate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StatusUpdateTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that a user can get a list of status updates.
     *
     * @return void
     */
    public function test_user_can_get_status_updates()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        StatusUpdate::factory()->count(3)->create();

        $response = $this->getJson('/api/status-updates');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test that a user can filter status updates by job.
     *
     * @return void
     */
    public function test_user_can_filter_status_updates_by_job()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $job1 = Job::factory()->create();
        $job2 = Job::factory()->create();

        StatusUpdate::factory()->count(2)->create(['job_id' => $job1->id]);
        StatusUpdate::factory()->count(3)->create(['job_id' => $job2->id]);

        $response = $this->getJson("/api/status-updates?job_id={$job1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test that an architect can create a status update.
     *
     * @return void
     */
    public function test_architect_can_create_status_update()
    {
        $architect = User::factory()->create();
        $this->actingAs($architect);

        // Create a job assigned to this architect
        $job = Job::factory()->create(['freelancer_id' => $architect->id]);

        $statusUpdateData = [
            'job_id' => $job->id,
            'content' => $this->faker->paragraph,
        ];

        $response = $this->postJson('/api/status-updates', $statusUpdateData);

        $response->assertStatus(201)
            ->assertJsonPath('data.job_id', $job->id)
            ->assertJsonPath('data.user_id', $architect->id)
            ->assertJsonPath('data.content', $statusUpdateData['content'])
            ->assertJsonPath('data.is_read', false);
    }

    /**
     * Test that a user can view a specific status update.
     *
     * @return void
     */
    public function test_user_can_view_status_update()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $statusUpdate = StatusUpdate::factory()->create();

        $response = $this->getJson("/api/status-updates/{$statusUpdate->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $statusUpdate->id);
    }

    /**
     * Test that a user can mark a status update as read.
     *
     * @return void
     */
    public function test_user_can_mark_status_update_as_read()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $statusUpdate = StatusUpdate::factory()->create(['is_read' => false]);

        $response = $this->putJson("/api/status-updates/{$statusUpdate->id}/read");

        $response->assertStatus(200);
        $this->assertTrue(StatusUpdate::find($statusUpdate->id)->is_read);
    }

    /**
     * Test that an architect can delete their own status update.
     *
     * @return void
     */
    public function test_architect_can_delete_own_status_update()
    {
        $architect = User::factory()->create();
        $this->actingAs($architect);

        $statusUpdate = StatusUpdate::factory()->create(['user_id' => $architect->id]);

        $response = $this->deleteJson("/api/status-updates/{$statusUpdate->id}");

        $response->assertStatus(200);
        $this->assertNull(StatusUpdate::find($statusUpdate->id));
    }

    /**
     * Test that an architect cannot delete another architect's status update.
     *
     * @return void
     */
    public function test_architect_cannot_delete_others_status_update()
    {
        $architect1 = User::factory()->create();
        $architect2 = User::factory()->create();
        $this->actingAs($architect1);

        $statusUpdate = StatusUpdate::factory()->create(['user_id' => $architect2->id]);

        $response = $this->deleteJson("/api/status-updates/{$statusUpdate->id}");

        $response->assertStatus(403);
        $this->assertNotNull(StatusUpdate::find($statusUpdate->id));
    }
}
