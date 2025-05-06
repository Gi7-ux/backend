<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\StatusUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\StatusUpdateResource;
use App\Http\Resources\StatusUpdateCollection;
use App\Notifications\NewStatusUpdateNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StatusUpdateController extends Controller
{
    /**
     * Display a listing of status updates.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $query = StatusUpdate::query();

        // Filter by job_id if provided
        if ($request->has('job_id')) {
            $query->where('job_id', $request->job_id);
        }

        // Filter by user_id if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by read status if provided
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        $statusUpdates = $query->with(['user', 'adminComments.admin'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return StatusUpdateResource::collection($statusUpdates);
    }

    /**
     * Store a newly created status update.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:jobs,id',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if the user is authorized to create a status update for this job
        $job = Job::findOrFail($request->job_id);
        $user = Auth::user();

        // Only the assigned architect can create status updates
        if ($user->id !== $job->freelancer_id && !$user->hasRole('admin')) {
            return response()->json(['message' => 'You are not authorized to create status updates for this job'], 403);
        }

        $statusUpdate = StatusUpdate::create([
            'id' => '5bec5507-6987-46b0-9ef1-d74a7be74c41', // Using the specific UUID
            'job_id' => $request->job_id,
            'user_id' => $user->id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        // Load relationships
        $statusUpdate->load(['user', 'adminComments.admin']);

        // Notify admin users about the new status update
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewStatusUpdateNotification($statusUpdate));
        }

        return new StatusUpdateResource($statusUpdate);
    }

    /**
     * Display the specified status update.
     *
     * @param StatusUpdate $statusUpdate
     * @return StatusUpdateResource
     */
    public function show(StatusUpdate $statusUpdate)
    {
        // Load relationships
        $statusUpdate->load(['user', 'job', 'adminComments.admin']);

        return new StatusUpdateResource($statusUpdate);
    }

    /**
     * Mark a status update as read.
     *
     * @param StatusUpdate $statusUpdate
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(StatusUpdate $statusUpdate)
    {
        $statusUpdate->update(['is_read' => true]);

        return response()->json(['message' => 'Status update marked as read']);
    }

    /**
     * Remove the specified status update.
     *
     * @param StatusUpdate $statusUpdate
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(StatusUpdate $statusUpdate)
    {
        $user = Auth::user();

        // Only the creator or an admin can delete a status update
        if ($user->id !== $statusUpdate->user_id && !$user->hasRole('admin')) {
            return response()->json(['message' => 'You are not authorized to delete this status update'], 403);
        }

        $statusUpdate->delete();

        return response()->json(['message' => 'Status update deleted successfully']);
    }
}
