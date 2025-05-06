<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        if (!in_array($user->role->name, $roles)) {
            return response()->json([
                'message' => 'Unauthorized - Insufficient permissions'
            ], 403);
        }

        return $next($request);
    }
}