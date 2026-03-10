<?php

use App\Http\Controllers\Api\DatabaseBrowserController;
use App\Http\Controllers\Api\ApprovedJobsController;
use App\Http\Controllers\Api\JobApplicationsController;
use App\Http\Controllers\Api\SaveJobsController;
use App\Http\Controllers\Api\JobseekerLoginController;
use App\Http\Controllers\Api\JobseekerProfileController;
use App\Http\Controllers\Api\JobseekerRegisterController;
use Illuminate\Support\Facades\Route;

Route::post('jobseeker/register', JobseekerRegisterController::class);
Route::post('jobseeker/login', JobseekerLoginController::class);
Route::get('jobseeker/{user}/profile', [JobseekerProfileController::class, 'show']);
Route::put('jobseeker/{user}/profile', [JobseekerProfileController::class, 'update']);
Route::get('jobs/approved', [ApprovedJobsController::class, 'index']);
Route::get('jobs/saved', [SaveJobsController::class, 'index']);
Route::get('jobs/saved/count', [SaveJobsController::class, 'count']);
Route::post('jobs/{job}/save', [SaveJobsController::class, 'store']);
Route::delete('jobs/{job}/save', [SaveJobsController::class, 'destroy']);
Route::get('jobs/applications', [JobApplicationsController::class, 'index']);
Route::get('jobs/applications/count', [JobApplicationsController::class, 'count']);
Route::post('jobs/applications/{application}/cancel', [JobApplicationsController::class, 'cancel']);
Route::post('jobs/{job}/apply', [JobApplicationsController::class, 'store']);

Route::prefix('db')->group(function () {
    Route::get('tables', [DatabaseBrowserController::class, 'tables']);
    Route::get('tables/{table}/columns', [DatabaseBrowserController::class, 'columns']);
    Route::get('tables/{table}/rows', [DatabaseBrowserController::class, 'rows']);
});

