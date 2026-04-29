<?php

use App\Modules\Holiday\Controllers\HolidayController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/holidays', [HolidayController::class, 'index']);
    Route::get('/holidays/countries', [HolidayController::class, 'countries']);
    Route::post('/holidays', [HolidayController::class, 'store']);
    Route::put('/holidays/{holiday}', [HolidayController::class, 'update']);
    Route::delete('/holidays/{holiday}', [HolidayController::class, 'destroy']);
});
