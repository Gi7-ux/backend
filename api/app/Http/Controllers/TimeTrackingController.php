<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use Illuminate\Http\Request;
use App\Http\Resources\ApiResponse;
use App\Http\Resources\TimeEntryResource;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TimeTrackingController extends Controller
{
    /**
     * Get time entries for authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = TimeEntry::query();

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Admins can see all time entries
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        $entries = $query->with(['user', 'project'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 20);

        return new ApiResponse(true, 'Time entries retrieved', TimeEntryResource::collection($entries));
    }

    /**
     * Create a new time entry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        // Freelancers can only track time for their own projects
        if ($user->hasRole('freelancer')) {
            $validated['user_id'] = $user->id;
        }

        $entry = TimeEntry::create($validated);

        return new ApiResponse(true, 'Time entry created', new TimeEntryResource($entry), 201);
    }

    /**
     * Update a time entry
     */
    public function update(Request $request, $id)
    {
        $entry = TimeEntry::findOrFail($id);
        $user = Auth::user();

        // Only admin or entry owner can update
        if (!$user->hasRole('admin') && $entry->user_id !== $user->id) {
            return new ApiResponse(false, 'Unauthorized to update this time entry', null, 403);
        }

        $validated = $request->validate([
            'project_id' => 'sometimes|exists:projects,id',
            'date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:500'
        ]);

        $entry->update($validated);

        return new ApiResponse(true, 'Time entry updated', new TimeEntryResource($entry));
    }

    /**
     * Delete a time entry
     */
    public function destroy($id)
    {
        $entry = TimeEntry::findOrFail($id);
        $user = Auth::user();

        // Only admin or entry owner can delete
        if (!$user->hasRole('admin') && $entry->user_id !== $user->id) {
            return new ApiResponse(false, 'Unauthorized to delete this time entry', null, 403);
        }

        $entry->delete();

        return new ApiResponse(true, 'Time entry deleted');
    }

    /**
     * Get time entry summary
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        $query = TimeEntry::query();

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Admins can see all time entries
        if (!$user->hasRole('admin')) {
            $query->where('user_id', $user->id);
        }

        $summary = $query->selectRaw('
            SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) / 60 as total_hours,
            COUNT(*) as total_entries,
            project_id
        ')
        ->groupBy('project_id')
        ->with('project')
        ->get();

        return new ApiResponse(true, 'Time entry summary', $summary);
    }
}