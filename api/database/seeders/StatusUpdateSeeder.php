<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\User;
use App\Models\StatusUpdate;
use App\Models\AdminComment;
use Illuminate\Database\Seeder;

class StatusUpdateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a specific status update with the given UUID
        $job = Job::first() ?? Job::factory()->create();
        $architect = User::where('id', $job->freelancer_id)->first() ?? User::factory()->create();
        
        $statusUpdate = StatusUpdate::create([
            'id' => '5bec5507-6987-46b0-9ef1-d74a7be74c41',
            'job_id' => $job->id,
            'user_id' => $architect->id,
            'content' => 'Initial project setup completed. I have prepared the preliminary sketches and will be working on the detailed floor plans next. Would appreciate any feedback on the initial concept.',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Create an admin comment for this status update
        $admin = User::role('admin')->first() ?? User::factory()->create();
        
        AdminComment::create([
            'status_update_id' => $statusUpdate->id,
            'admin_id' => $admin->id,
            'content' => 'Thanks for the update. The initial concept looks promising. Please proceed with the detailed floor plans and make sure to include the sustainability features we discussed.',
            'is_read' => false,
            'created_at' => now()->addHours(2),
            'updated_at' => now()->addHours(2),
        ]);
        
        // Create some additional random status updates
        StatusUpdate::factory()
            ->count(5)
            ->create([
                'job_id' => $job->id,
                'user_id' => $architect->id,
            ])
            ->each(function ($statusUpdate) use ($admin) {
                // Add 0-3 admin comments to each status update
                $commentCount = rand(0, 3);
                if ($commentCount > 0) {
                    AdminComment::factory()
                        ->count($commentCount)
                        ->create([
                            'status_update_id' => $statusUpdate->id,
                            'admin_id' => $admin->id,
                        ]);
                }
            });
    }
}
