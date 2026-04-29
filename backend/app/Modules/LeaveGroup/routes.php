<?php

use App\Modules\LeaveGroup\Controllers\LeaveGroupController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leave-groups', [LeaveGroupController::class, 'index']);
    Route::get('/leave-groups/{leaveGroup}', [LeaveGroupController::class, 'show']);
    Route::post('/leave-groups', [LeaveGroupController::class, 'store']);
    Route::put('/leave-groups/{leaveGroup}', [LeaveGroupController::class, 'update']);
    Route::delete('/leave-groups/{leaveGroup}', [LeaveGroupController::class, 'destroy']);
});
