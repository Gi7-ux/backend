<?php

namespace App\Http\Controllers;

use App\Models\AdminComment;
use App\Models\StatusUpdate;
use Illuminate\Http\Request;
use App\Http\Resources\AdminCommentResource;
use App\Notifications\NewAdminCommentNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AdminCommentController extends Controller
{
    /**
     * Display a listing of admin comments for a status update.
     *
     * @param StatusUpdate $statusUpdate
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(StatusUpdate $statusUpdate)
    {
        $comments = $statusUpdate->adminComments()
            ->with('admin')
            ->orderBy('created_at', 'asc')
            ->get();

        return AdminCommentResource::collection($comments);
    }

    /**
     * Store a newly created admin comment.
     *
     * @param Request $request
     * @param StatusUpdate $statusUpdate
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, StatusUpdate $statusUpdate)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // Only admins can create admin comments
        if (!$user->hasRole('admin')) {
            return response()->json(['message' => 'Only administrators can add comments to status updates'], 403);
        }

        $comment = AdminComment::create([
            'status_update_id' => $statusUpdate->id,
            'admin_id' => $user->id,
            'content' => $request->content,
            'is_read' => false,
        ]);

        // Load admin relationship
        $comment->load('admin');

        // Notify the status update creator about the new comment
        $statusUpdate->user->notify(new NewAdminCommentNotification($comment));

        return new AdminCommentResource($comment);
    }

    /**
     * Mark an admin comment as read.
     *
     * @param AdminComment $adminComment
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(AdminComment $adminComment)
    {
        $adminComment->update(['is_read' => true]);

        return response()->json(['message' => 'Admin comment marked as read']);
    }

    /**
     * Remove the specified admin comment.
     *
     * @param AdminComment $adminComment
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(AdminComment $adminComment)
    {
        $user = Auth::user();

        // Only the admin who created the comment can delete it
        if ($user->id !== $adminComment->admin_id) {
            return response()->json(['message' => 'You are not authorized to delete this comment'], 403);
        }

        $adminComment->delete();

        return response()->json(['message' => 'Admin comment deleted successfully']);
    }
}
