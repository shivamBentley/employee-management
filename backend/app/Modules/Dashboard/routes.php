<?php

use App\Modules\Dashboard\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/leave-summary', [DashboardController::class, 'leaveSummary']);
    Route::get('/reports/pdf',   [DashboardController::class, 'exportPdf']);
    Route::get('/reports/excel', [DashboardController::class, 'exportExcel']);
});
