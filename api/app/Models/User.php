<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role.
     *
     * @param string $role
     * @return bool
     */
    public function hasRole(string $role): bool
    {
        // This is a placeholder implementation
        // In a real application, this would check against a roles table
        return in_array($role, ['admin', 'client', 'architect']);
    }

    /**
     * Get the jobs posted by this user (as a client).
     */
    public function postedJobs()
    {
        return $this->hasMany(Job::class, 'client_id');
    }

    /**
     * Get the jobs assigned to this user (as a freelancer/architect).
     */
    public function assignedJobs()
    {
        return $this->hasMany(Job::class, 'freelancer_id');
    }

    /**
     * Get the status updates created by this user.
     */
    public function statusUpdates()
    {
        return $this->hasMany(StatusUpdate::class, 'user_id');
    }

    /**
     * Get the admin comments created by this user.
     */
    public function adminComments()
    {
        return $this->hasMany(AdminComment::class, 'admin_id');
    }
}
