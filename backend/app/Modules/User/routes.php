<?php

use App\Modules\User\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Own profile
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/me', [UserController::class, 'updateMe']); // multipart/form-data for avatar

    // Admin: full CRUD
    Route::apiResource('users', UserController::class);
});
