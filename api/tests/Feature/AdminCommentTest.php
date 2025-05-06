<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\StatusUpdate;
use App\Models\AdminComment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AdminCommentTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test that a user can get a list of admin comments for a status update.
     *
     * @return void
     */
    public function test_user_can_get_admin_comments()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $statusUpdate = StatusUpdate::factory()->create();
        AdminComment::factory()->count(3)->create(['status_update_id' => $statusUpdate->id]);

        $response = $this->getJson("/api/status-updates/{$statusUpdate->id}/comments");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test that an admin can create a comment on a status update.
     *
     * @return void
     */
    public function test_admin_can_create_comment()
    {
        $admin = User::factory()->create();
        $admin->roles = ['admin']; // Mock admin role
        $this->actingAs($admin);

        $statusUpdate = StatusUpdate::factory()->create();

        $commentData = [
            'content' => $this->faker->paragraph,
        ];

        $response = $this->postJson("/api/status-updates/{$statusUpdate->id}/comments", $commentData);

        $response->assertStatus(201)
            ->assertJsonPath('data.status_update_id', $statusUpdate->id)
            ->assertJsonPath('data.admin_id', $admin->id)
            ->assertJsonPath('data.content', $commentData['content'])
            ->assertJsonPath('data.is_read', false);
    }

    /**
     * Test that a non-admin user cannot create a comment.
     *
     * @return void
     */
    public function test_non_admin_cannot_create_comment()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $statusUpdate = StatusUpdate::factory()->create();

        $commentData = [
            'content' => $this->faker->paragraph,
        ];

        $response = $this->postJson("/api/status-updates/{$statusUpdate->id}/comments", $commentData);

        $response->assertStatus(403);
    }

    /**
     * Test that a user can mark an admin comment as read.
     *
     * @return void
     */
    public function test_user_can_mark_comment_as_read()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $adminComment = AdminComment::factory()->create(['is_read' => false]);

        $response = $this->putJson("/api/status-updates/comments/{$adminComment->id}/read");

        $response->assertStatus(200);
        $this->assertTrue(AdminComment::find($adminComment->id)->is_read);
    }

    /**
     * Test that an admin can delete their own comment.
     *
     * @return void
     */
    public function test_admin_can_delete_own_comment()
    {
        $admin = User::factory()->create();
        $admin->roles = ['admin']; // Mock admin role
        $this->actingAs($admin);

        $adminComment = AdminComment::factory()->create(['admin_id' => $admin->id]);

        $response = $this->deleteJson("/api/status-updates/comments/{$adminComment->id}");

        $response->assertStatus(200);
        $this->assertNull(AdminComment::find($adminComment->id));
    }

    /**
     * Test that an admin cannot delete another admin's comment.
     *
     * @return void
     */
    public function test_admin_cannot_delete_others_comment()
    {
        $admin1 = User::factory()->create();
        $admin1->roles = ['admin']; // Mock admin role
        $admin2 = User::factory()->create();
        $admin2->roles = ['admin']; // Mock admin role
        $this->actingAs($admin1);

        $adminComment = AdminComment::factory()->create(['admin_id' => $admin2->id]);

        $response = $this->deleteJson("/api/status-updates/comments/{$adminComment->id}");

        $response->assertStatus(403);
        $this->assertNotNull(AdminComment::find($adminComment->id));
    }
}
