<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationFailure extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'channel',
        'error_message',
        'notification_data',
        'attempts',
        'last_attempt_at',
        'last_error',
        'resolved_at',
        'resolution_notes',
        'failed_permanently_at',
        'final_error'
    ];

    protected $casts = [
        'notification_data' => 'json',
        'last_attempt_at' => 'datetime',
        'resolved_at' => 'datetime',
        'failed_permanently_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}