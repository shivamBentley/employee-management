<?php

use App\Modules\User\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Own profile
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/me', [UserController::class, 'updateMe']); // multipart/form-data for avatar
    Route::put('/me/password', [UserController::class, 'updatePassword']);
    Route::get('/me/leave-stats', [UserController::class, 'leaveStats']);

    // Admin: full CRUD
    Route::apiResource('users', UserController::class);
    Route::get('/users/{user}/leave-stats', [UserController::class, 'leaveStats']);
});
