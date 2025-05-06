<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\JobResource;
use App\Notifications\JobApplicationReceived;
use App\Notifications\JobAssigned;

class JobAssignmentController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Apply for a job as a freelancer.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function apply(Request $request, Job $job)
    {
        $user = Auth::user();

        if (!$user->hasRole('freelancer')) {
            return response()->json(['message' => 'Only freelancers can apply for jobs'], 403);
        }

        if ($job->status !== 'open') {
            return response()->json(['message' => 'This job is not open for applications'], 422);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string|max:2000',
            'proposed_rate' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create job application
        $application = $job->applications()->create([
            'freelancer_id' => $user->id,
            'cover_letter' => $request->cover_letter,
            'proposed_rate' => $request->proposed_rate,
            'status' => 'pending'
        ]);

        // Notify the client
        $job->client->notify(new JobApplicationReceived($job, $user, $application));

        return response()->json(['message' => 'Application submitted successfully']);
    }

    /**
     * Assign a job to a freelancer.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function assign(Request $request, Job $job)
    {
        $user = Auth::user();

        if (!$user->hasRole('admin') && $user->id !== $job->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'freelancer_id' => 'required|exists:users,id',
            'rate' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $freelancer = User::findOrFail($request->freelancer_id);
        
        if (!$freelancer->hasRole('freelancer')) {
            return response()->json(['message' => 'Selected user is not a freelancer'], 422);
        }

        if ($job->status !== 'open') {
            return response()->json(['message' => 'This job cannot be assigned'], 422);
        }

        // Update job status and assign freelancer
        $job->update([
            'freelancer_id' => $freelancer->id,
            'status' => 'in_progress',
            'hourly_rate' => $request->rate
        ]);

        // Update application status
        $job->applications()
            ->where('freelancer_id', $freelancer->id)
            ->update(['status' => 'accepted']);
        
        // Reject other applications
        $job->applications()
            ->where('freelancer_id', '!=', $freelancer->id)
            ->update(['status' => 'rejected']);

        // Notify the freelancer
        $freelancer->notify(new JobAssigned($job));

        return new JobResource($job);
    }
}