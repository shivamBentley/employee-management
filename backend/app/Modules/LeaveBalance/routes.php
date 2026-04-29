<?php

use App\Modules\LeaveBalance\Controllers\LeaveBalanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leave-balances', [LeaveBalanceController::class, 'index']);
    Route::get('/leave-balances/monthly', [LeaveBalanceController::class, 'monthly']);
    Route::get('/leave-balances/calculate', [LeaveBalanceController::class, 'calculate']);
    Route::post('/leave-balances/provision', [LeaveBalanceController::class, 'provision']);
});
