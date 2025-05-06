<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Resources\JobResource;
use App\Http\Resources\ApiResponse;
use App\Notifications\JobStatusUpdated;
use App\Notifications\AdminMessageReceived;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:admin');
    }

    /**
     * List all jobs with detailed information for admin review.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listJobs(Request $request)
    {
        $jobs = Job::with(['client', 'freelancer', 'applications'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->paginate(15);

        return ApiResponse::success(
            JobResource::collection($jobs),
            'Jobs retrieved successfully'
        );
    }

    /**
     * Handle job status updates and notify relevant parties.
     *
     * @param Request $request
     * @param Job $job
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateJobStatus(Request $request, Job $job)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:under_review,approved,rejected,in_progress,completed,cancelled',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ApiResponse::validationError($validator->errors());
        }

        $oldStatus = $job->status;
        $job->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes
        ]);

        // Notify relevant parties
        if ($job->client) {
            $job->client->notify(new JobStatusUpdated($job, $oldStatus, $request->admin_notes));
        }
        if ($job->freelancer) {
            $job->freelancer->notify(new JobStatusUpdated($job, $oldStatus, $request->admin_notes));
        }

        return ApiResponse::success(
            new JobResource($job),
            'Job status updated successfully'
        );
    }

    /**
     * Forward client message to freelancer or vice versa through admin.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forwardMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:jobs,id',
            'from_id' => 'required|exists:users,id',
            'to_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ApiResponse::validationError($validator->errors());
        }

        $message = Message::create([
            'job_id' => $request->job_id,
            'from_id' => Auth::id(), // Admin is the sender
            'to_id' => $request->to_id,
            'message' => $request->message,
            'original_sender_id' => $request->from_id,
            'admin_notes' => $request->admin_notes
        ]);

        // Notify recipient
        $recipient = User::find($request->to_id);
        $recipient->notify(new AdminMessageReceived($message));

        return ApiResponse::success(
            $message,
            'Message forwarded successfully'
        );
    }

    /**
     * Review and approve/reject job application.
     *
     * @param Request $request
     * @param int $applicationId
     * @return \Illuminate\Http\JsonResponse
     */
    public function reviewApplication(Request $request, $applicationId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ApiResponse::validationError($validator->errors());
        }

        $application = JobApplication::findOrFail($applicationId);
        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes
        ]);

        // Notify both client and freelancer
        $application->job->client->notify(new ApplicationStatusUpdated($application));
        $application->freelancer->notify(new ApplicationStatusUpdated($application));

        return ApiResponse::success(
            new JobApplicationResource($application),
            'Application review completed successfully'
        );
    }
}