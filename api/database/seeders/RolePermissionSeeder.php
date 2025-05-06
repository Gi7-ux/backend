<?php

    namespace Database\Seeders;

    use App\Models\Permission;
    use App\Models\Role;
    use Illuminate\Database\Seeder;

    class RolePermissionSeeder extends Seeder
    {
        public function run()
        {
            $admin = Role::where('slug', 'admin')->first();
            $freelancer = Role::where('slug', 'freelancer')->first();
            $client = Role::where('slug', 'client')->first();

            $permissions = Permission::all();

            // Admin has all permissions
            $admin->permissions()->sync($permissions->pluck('id'));

            // Freelancer permissions
            $freelancerPermissions = $permissions->filter(function ($permission) {
                return in_array($permission->slug, [
                    'view_job', 'apply_job', 'create_time_entry', 'view_time_entries',
                    'send_message', 'view_messages', 'view_profile', 'update_profile',
                ]);
            });
            $freelancer->permissions()->sync($freelancerPermissions->pluck('id'));

            // Client permissions
            $clientPermissions = $permissions->filter(function ($permission) {
                return in_array($permission->slug, [
                    'create_job', 'view_job', 'update_job', 'delete_job', 'view_applications',
                    'send_message', 'view_messages', 'view_profile', 'update_profile',
                ]);
            });
            $client->permissions()->sync($clientPermissions->pluck('id'));
        }
    }