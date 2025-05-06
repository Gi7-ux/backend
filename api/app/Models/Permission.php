<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'group',
    ];

    /**
     * The roles that belong to the permission.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Get all users that have this permission through roles.
     */
    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            Role::class,
            'permission_role',
            'role_user'
        );
    }

    /**
     * Scope a query to only include permissions of a specific group.
     */
    public function scopeGroup($query, $group)
    {
        return $query->where('group', $group);
    }
}
