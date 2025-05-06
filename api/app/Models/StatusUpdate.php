<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StatusUpdate extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'job_id',
        'user_id',
        'content',
        'is_read',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the job that this status update is for.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user (architect) who created this status update.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin comments for this status update.
     */
    public function adminComments()
    {
        return $this->hasMany(AdminComment::class);
    }
}
