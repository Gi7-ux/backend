<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\JobResource;

class JobController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('permission:view-jobs')->only(['index', 'show']);
        $this->middleware('permission:create-jobs')->only(['store']);
        $this->middleware('permission:edit-jobs')->only(['update']);
        $this->middleware('permission:delete-jobs')->only(['destroy']);
    }

    /**
     * Display a listing of jobs based on user role.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        
        $jobs = Job::when($user->hasRole('client'), function ($query) use ($user) {
            return $query->where('client_id', $user->id);
        })->when($user->hasRole('freelancer'), function ($query) use ($user) {
            return $query->where('freelancer_id', $user->id);
        })->latest()->paginate(10);

        return JobResource::collection($jobs);
    }

    /**
     * Store a new job.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget' => 'required|numeric|min:0',
            'deadline' => 'required|date|after:today',
            'skills_required' => 'required|array',
            'skills_required.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $job = Job::create([
            'title' => $request->title,
            'description' => $request->description,
            'budget' => $request->budget,
            'deadline' => $request->deadline,
            'skills_required' => $request->skills_required,
            'client_id' => Auth::id(),
            'status' => 'open'
        ]);

        return new JobResource($job);
    }

    /**
     * Display the specified job.
     *
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Job $job)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('admin') && 
            $user->id !== $job->client_id && 
            $user->id !== $job->freelancer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new JobResource($job);
    }

    /**
     * Update the specified job.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Job $job)
    {
        $user = Auth::user();
        
        // Only admin can change status
        if ($request->has('status') && !$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Only administrators can change job status. Please contact admin for status updates.'
            ], 403);
        }

        // Freelancer can update progress but not other fields
        if ($user->hasRole('freelancer')) {
            if ($user->id !== $job->freelancer_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'progress_notes' => 'required|string',
                'completion_percentage' => 'sometimes|required|integer|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Only update progress-related fields
            $job->update([
                'progress_notes' => $request->progress_notes,
                'completion_percentage' => $request->completion_percentage
            ]);

            // Notify admin of progress update
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new JobProgressUpdated($job));
            }

            return new JobResource($job);
        }

        // Client can update job details only if it's in 'open' status
        if ($user->hasRole('client')) {
            if ($user->id !== $job->client_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($job->status !== 'open') {
                return response()->json([
                    'message' => 'Cannot modify job details after it has been assigned. Please contact admin for any changes.'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'budget' => 'sometimes|required|numeric|min:0',
                'deadline' => 'sometimes|required|date|after:today',
                'skills_required' => 'sometimes|required|array',
                'skills_required.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $job->update($request->only([
                'title', 'description', 'budget', 'deadline', 'skills_required'
            ]));

            // Notify admin of job updates
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new JobDetailsUpdated($job));
            }

            return new JobResource($job);
        }

        // Admin can update all fields
        if ($user->hasRole('admin')) {
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'budget' => 'sometimes|required|numeric|min:0',
                'deadline' => 'sometimes|required|date|after:today',
                'status' => 'sometimes|required|in:open,in_progress,completed,cancelled',
                'skills_required' => 'sometimes|required|array',
                'skills_required.*' => 'string',
                'admin_notes' => 'sometimes|string'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $job->update($request->all());

            // Notify relevant parties of updates
            if ($job->client) {
                $job->client->notify(new JobUpdatedByAdmin($job));
            }
            if ($job->freelancer) {
                $job->freelancer->notify(new JobUpdatedByAdmin($job));
            }

            return new JobResource($job);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Remove the specified job.
     *
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Job $job)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('admin') && $user->id !== $job->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($job->status !== 'open') {
            return response()->json(['message' => 'Cannot delete job that is not in open status'], 422);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }
}