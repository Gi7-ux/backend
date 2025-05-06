<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job' => new JobResource($this->whenLoaded('job')),
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'cover_letter' => $this->cover_letter,
            'proposed_rate' => $this->proposed_rate,
            'status' => $this->status,
            'notes' => $this->when($this->notes, $this->notes),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include metadata based on user role and permissions
            'can_update' => $request->user()->can('update', $this->resource),
            'can_delete' => $request->user()->can('delete', $this->resource),
            
            // Additional metadata for clients/admins
            'metadata' => $this->when(
                $request->user()->can('view-application-details', $this->resource),
                [
                    'freelancer_rating' => $this->freelancer->average_rating,
                    'freelancer_jobs_completed' => $this->freelancer->completed_jobs_count,
                    'freelancer_success_rate' => $this->freelancer->success_rate
                ]
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
                'can_accept' => $request->user()->can('accept', $this->resource),
                'can_reject' => $request->user()->can('reject', $this->resource),
                'is_client' => $request->user()->id === $this->job->client_id
            ]
        ];
    }
}