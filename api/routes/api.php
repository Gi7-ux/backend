<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TimeTrackingController;
use App\Http\Controllers\StatusUpdateController;
use App\Http\Controllers\AdminCommentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    // Messaging routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::post('/', [MessageController::class, 'store']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
        Route::put('/{id}/read', [MessageController::class, 'markAsRead']);
        Route::delete('/{id}', [MessageController::class, 'destroy']);
    });

    // Time tracking routes
    Route::prefix('time-entries')->group(function () {
        Route::get('/', [TimeTrackingController::class, 'index']);
        Route::post('/', [TimeTrackingController::class, 'store']);
        Route::put('/{id}', [TimeTrackingController::class, 'update']);
        Route::delete('/{id}', [TimeTrackingController::class, 'destroy']);
        Route::get('/summary', [TimeTrackingController::class, 'summary']);
    });

    // Status update routes
    Route::prefix('status-updates')->group(function () {
        Route::get('/', [StatusUpdateController::class, 'index']);
        Route::post('/', [StatusUpdateController::class, 'store']);
        Route::get('/{statusUpdate}', [StatusUpdateController::class, 'show']);
        Route::put('/{statusUpdate}/read', [StatusUpdateController::class, 'markAsRead']);
        Route::delete('/{statusUpdate}', [StatusUpdateController::class, 'destroy']);

        // Admin comments on status updates
        Route::get('/{statusUpdate}/comments', [AdminCommentController::class, 'index']);
        Route::post('/{statusUpdate}/comments', [AdminCommentController::class, 'store']);
        Route::put('/comments/{adminComment}/read', [AdminCommentController::class, 'markAsRead']);
        Route::delete('/comments/{adminComment}', [AdminCommentController::class, 'destroy']);
    });
});