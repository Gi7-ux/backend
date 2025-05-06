<?php

    namespace Database\Seeders;

    use App\Models\Permission;
    use Illuminate\Database\Seeder;

    class PermissionSeeder extends Seeder
    {
        public function run()
        {
            $permissions = [
                ['name' => 'create_job', 'slug' => 'create_job', 'description' => 'Create a new job'],
                ['name' => 'view_job', 'slug' => 'view_job', 'description' => 'View a job'],
                ['name' => 'update_job', 'slug' => 'update_job', 'description' => 'Update a job'],
                ['name' => 'delete_job', 'slug' => 'delete_job', 'description' => 'Delete a job'],
                ['name' => 'apply_job', 'slug' => 'apply_job', 'description' => 'Apply for a job'],
                ['name' => 'view_applications', 'slug' => 'view_applications', 'description' => 'View job applications'],
                ['name' => 'create_time_entry', 'slug' => 'create_time_entry', 'description' => 'Create a time entry'],
                ['name' => 'view_time_entries', 'slug' => 'view_time_entries', 'description' => 'View time entries'],
                ['name' => 'send_message', 'slug' => 'send_message', 'description' => 'Send a message'],
                ['name' => 'view_messages', 'slug' => 'view_messages', 'description' => 'View messages'],
                ['name' => 'view_profile', 'slug' => 'view_profile', 'description' => 'View user profile'],
                ['name' => 'update_profile', 'slug' => 'update_profile', 'description' => 'Update user profile'],
                ['name' => 'view_settings', 'slug' => 'view_settings', 'description' => 'View app settings'],
                ['name' => 'update_settings', 'slug' => 'update_settings', 'description' => 'Update app settings'],
            ];

            foreach ($permissions as $permission) {
                Permission::create($permission);
            }
        }
    }