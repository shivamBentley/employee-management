<?php

use App\Modules\Backup\Controllers\BackupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'feature:backup_enabled'])->group(function () {
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups', [BackupController::class, 'run']);
    Route::get('/backups/{filename}/download', [BackupController::class, 'download'])
        ->where('filename', '.*');
    Route::post('/backups/restore', [BackupController::class, 'restore']);
});
