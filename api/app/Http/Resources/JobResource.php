<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'budget' => $this->budget,
            'deadline' => $this->deadline,
            'status' => $this->status,
            'skills_required' => $this->skills_required,
            'client' => new UserResource($this->whenLoaded('client')),
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'time_entries' => TimeEntryResource::collection($this->whenLoaded('timeEntries')),
            'messages_count' => $this->whenCounted('messages'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Include these relationships only if they're requested and authorized
            'messages' => $this->when(
                $request->user()->can('view-job-messages', $this),
                MessageResource::collection($this->whenLoaded('messages'))
            ),
            
            // Include additional metadata for authorized users
            'metadata' => $this->when(
                $request->user()->can('view-job-details', $this), 
                [
                    'total_hours' => $this->whenLoaded('timeEntries', function () {
                        return $this->timeEntries->sum('hours');
                    }),
                    'total_budget_spent' => $this->whenLoaded('timeEntries', function () {
                        return $this->timeEntries->sum('billable_amount');
                    })
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
                'can_edit' => $request->user()->can('edit-jobs'),
                'can_delete' => $request->user()->can('delete-jobs')
            ]
        ];
    }
}