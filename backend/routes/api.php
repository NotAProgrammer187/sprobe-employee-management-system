<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management routes (Admin only)
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    // Dashboard stats
    Route::get('/dashboard/stats', [UserController::class, 'getDashboardStats']);

    // Employee routes
    Route::prefix('employees')->group(function () {
        Route::get('/', [EmployeeController::class, 'index']);
        Route::post('/', [EmployeeController::class, 'store']);
        Route::get('/active', [EmployeeController::class, 'getActive']);
        Route::get('/by-manager/{managerId}', [EmployeeController::class, 'getByManager']);
        Route::get('/{id}', [EmployeeController::class, 'show']);
        Route::put('/{id}', [EmployeeController::class, 'update']);
        Route::delete('/{id}', [EmployeeController::class, 'destroy']);
        Route::get('/{id}/reviews', [EmployeeController::class, 'getReviews']);
    });

    // Review routes
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::post('/', [ReviewController::class, 'store']);
        Route::get('/upcoming', [ReviewController::class, 'upcoming']);
        Route::get('/completed', [ReviewController::class, 'completed']);
        Route::get('/by-reviewer/{reviewerId}', [ReviewController::class, 'getByReviewer']);
        Route::get('/{id}', [ReviewController::class, 'show']);
        Route::put('/{id}', [ReviewController::class, 'update']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
        Route::post('/{id}/submit', [ReviewController::class, 'submit']);
        Route::post('/{id}/approve', [ReviewController::class, 'approve']);
        Route::post('/{id}/reject', [ReviewController::class, 'reject']);
    });

    // Review Templates routes
    Route::prefix('review-templates')->group(function () {
        Route::get('/', [ReviewTemplateController::class, 'index']);
        Route::post('/', [ReviewTemplateController::class, 'store']);
        Route::get('/{id}', [ReviewTemplateController::class, 'show']);
        Route::put('/{id}', [ReviewTemplateController::class, 'update']);
        Route::delete('/{id}', [ReviewTemplateController::class, 'destroy']);
        Route::get('/{id}/criteria', [ReviewTemplateController::class, 'getCriteria']);
    });

    // Review Criteria routes
    Route::prefix('review-criteria')->group(function () {
        Route::get('/review/{reviewId}', [ReviewCriteriaController::class, 'getByReview']);
    });
});