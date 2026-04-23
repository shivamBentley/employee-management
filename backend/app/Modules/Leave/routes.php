<?php

use App\Modules\Leave\Controllers\LeaveController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'feature:leave_management_enabled'])->group(function () {
    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::put('/leaves/{leave}/approve', [LeaveController::class, 'approve']);
    Route::put('/leaves/{leave}/reject', [LeaveController::class, 'reject']);
    Route::delete('/leaves/{leave}', [LeaveController::class, 'destroy']);
});
