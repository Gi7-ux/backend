<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Resources\ApiResponse;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class MessageController extends Controller
{
    /**
     * Get messages for authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Message::query();

        // Filter by conversation if provided
        if ($request->has('conversation_id')) {
            $query->where('conversation_id', $request->conversation_id);
        }

        // Filter by recipient if provided
        if ($request->has('recipient_id')) {
            $query->where(function($q) use ($request, $user) {
                $q->where('sender_id', $user->id)
                  ->where('recipient_id', $request->recipient_id);
            })->orWhere(function($q) use ($request, $user) {
                $q->where('sender_id', $request->recipient_id)
                  ->where('recipient_id', $user->id);
            });
        }

        // Admins can see all messages
        if (!$user->hasRole('admin')) {
            $query->where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            });
        }

        $messages = $query->with(['sender', 'recipient'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return new ApiResponse(true, 'Messages retrieved', MessageResource::collection($messages));
    }

    /**
     * Send a new message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'content' => 'required|string|max:2000',
            'conversation_id' => 'nullable|exists:conversations,id'
        ]);

        $user = Auth::user();
        $recipient = User::findOrFail($validated['recipient_id']);

        // Check if user is allowed to message recipient
        if ($user->hasRole('freelancer') && $recipient->hasRole('freelancer')) {
            return new ApiResponse(false, 'Freelancers cannot message other freelancers', null, 403);
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $validated['recipient_id'],
            'conversation_id' => $validated['conversation_id'] ?? null,
            'content' => $validated['content'],
            'read_at' => null
        ]);

        // Notify recipient
        $recipient->notify(new NewMessageNotification($message));

        return new ApiResponse(true, 'Message sent', new MessageResource($message), 201);
    }

    /**
     * Mark message as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $message = Message::findOrFail($id);

        // Only recipient can mark as read
        if ($message->recipient_id !== $user->id) {
            return new ApiResponse(false, 'Unauthorized to mark this message as read', null, 403);
        }

        if (!$message->read_at) {
            $message->update(['read_at' => now()]);
        }

        return new ApiResponse(true, 'Message marked as read', new MessageResource($message));
    }

    /**
     * Delete a message
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $message = Message::findOrFail($id);

        // Only sender or recipient can delete
        if ($message->sender_id !== $user->id && $message->recipient_id !== $user->id) {
            return new ApiResponse(false, 'Unauthorized to delete this message', null, 403);
        }

        $message->delete();

        return new ApiResponse(true, 'Message deleted');
    }

    /**
     * Get unread message count
     */
    public function unreadCount()
    {
        $user = Auth::user();
        $count = Message::where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return new ApiResponse(true, 'Unread message count', ['count' => $count]);
    }
}