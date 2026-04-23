<?php

use App\Modules\Presence\Controllers\PresenceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'feature:presence_tracking_enabled'])->group(function () {
    Route::get('/presence', [PresenceController::class, 'index']);
    Route::put('/presence/status', [PresenceController::class, 'updateStatus']);
});
