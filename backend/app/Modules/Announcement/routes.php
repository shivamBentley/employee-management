<?php

use App\Modules\Announcement\Controllers\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'feature:announcements_enabled'])->group(function () {
    Route::apiResource('announcements', AnnouncementController::class);
});
