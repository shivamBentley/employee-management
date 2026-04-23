<?php

use App\Modules\Demo\Controllers\DemoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/demo/seed',  [DemoController::class, 'seed']);
    Route::post('/demo/reset', [DemoController::class, 'reset']);
});
