<?php

use App\Modules\LeaveType\Controllers\LeaveTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);
    Route::post('/leave-types', [LeaveTypeController::class, 'store']);
    Route::put('/leave-types/{leaveType}', [LeaveTypeController::class, 'update']);
    Route::delete('/leave-types/{leaveType}', [LeaveTypeController::class, 'destroy']);
});
