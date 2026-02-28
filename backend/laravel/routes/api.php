<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Articles
    Route::apiResource('articles', ArticleController::class);
    Route::patch('/articles/{article}/status', [ArticleController::class, 'updateStatus']);
    Route::get('/articles/{article}/history', [ArticleController::class, 'history']);
    Route::post('/articles/{article}/lock', [ArticleController::class, 'lock']);
    Route::delete('/articles/{article}/lock', [ArticleController::class, 'unlock']);
});
