<?php

use App\Modules\Department\Controllers\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('departments', DepartmentController::class)->except(['show']);
});
