<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'title',
        'description',
        'budget',
        'deadline',
        'status',
        'skills_required',
        'client_id',
        'freelancer_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'budget' => 'decimal:2',
        'deadline' => 'datetime',
        'skills_required' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the client that posted the job.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the freelancer assigned to the job.
     */
    public function freelancer()
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    /**
     * Get the time entries for the job.
     */
    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class);
    }

    /**
     * Get the messages associated with the job.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Scope a query to only include jobs with specific status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include jobs with budget in range.
     */
    public function scopeBudgetRange($query, $min, $max)
    {
        return $query->whereBetween('budget', [$min, $max]);
    }

    /**
     * Scope a query to only include jobs requiring specific skills.
     */
    public function scopeRequiresSkills($query, array $skills)
    {
        return $query->where(function ($query) use ($skills) {
            foreach ($skills as $skill) {
                $query->whereJsonContains('skills_required', $skill);
            }
        });
    }

    /**
     * Get the status updates for the job.
     */
    public function statusUpdates()
    {
        return $this->hasMany(StatusUpdate::class);
    }
}