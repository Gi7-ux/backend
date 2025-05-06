<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = Auth::user();

        return [
            'id' => $this->id,
            'job' => new JobResource($this->whenLoaded('job')),
            'from' => new UserResource($this->whenLoaded('sender')),
            'to' => new UserResource($this->whenLoaded('recipient')),
            'message' => $this->message,
            'original_message_id' => $this->when($this->original_message_id, $this->original_message_id),
            'original_sender_id' => $this->when($this->original_sender_id, $this->original_sender_id),
            'needs_admin_review' => $this->needs_admin_review,
            'admin_notes' => $this->when(
                $user->hasRole('admin') || $this->admin_notes_public,
                $this->admin_notes
            ),
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Show attachments if message is visible to user
            'attachments' => $this->when(
                $user->hasRole('admin') || 
                $user->id === $this->to_id || 
                $user->id === $this->from_id,
                $this->getMedia('message_attachments')->map(function($media) {
                    return [
                        'id' => $media->id,
                        'name' => $media->name,
                        'mime_type' => $media->mime_type,
                        'size' => $media->size,
                        'url' => $media->getUrl()
                    ];
                })
            ),

            // Permission-based metadata
            'can_reply' => $this->when(
                $user->hasRole('admin'), 
                true
            ),
            'can_forward' => $this->when(
                $user->hasRole('admin'), 
                true
            )
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function with($request): array
    {
        return [
            'meta' => [
                'is_admin' => $request->user()->hasRole('admin'),
                'is_recipient' => $request->user()->id === $this->to_id,
                'is_sender' => $request->user()->id === $this->from_id
            ]
        ];
    }
}