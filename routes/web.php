<?php

use App\Http\Controllers\Jobs\ListRequestJobsPostController;
use App\Http\Controllers\Jobs\PostJobsController;
use App\Http\Controllers\UserManagement\EmployerAccountController;
use App\Models\post_jobs;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $user = Auth::user();
    if ($user && $user->role === 'employer') {
        $userId = $user->id;
        $stats = [
            'total_jobs' => post_jobs::query()->where('user_id', $userId)->count(),
            'pending' => post_jobs::query()->where('user_id', $userId)->where('status', 'pending')->count(),
            'approved' => post_jobs::query()->where('user_id', $userId)->where('status', 'approved')->count(),
            'declined' => post_jobs::query()->where('user_id', $userId)->where('status', 'declined')->count(),
            'active' => post_jobs::query()->where('user_id', $userId)->where('status', 'active')->count(),
        ];
        return Inertia::render('dashboard-employer', [
            'stats' => $stats,
        ]);
    }
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('jobs/list-request-jobs-post', [ListRequestJobsPostController::class, 'index'])->name('list-request-jobs-post.index');
    Route::patch('jobs/list-request-jobs-post/{id}/approve', [ListRequestJobsPostController::class, 'approve'])->name('list-request-jobs-post.approve');
    Route::patch('jobs/list-request-jobs-post/{id}/decline', [ListRequestJobsPostController::class, 'decline'])->name('list-request-jobs-post.decline');
    Route::get('jobs/post-jobs', [PostJobsController::class, 'index'])->name('post-jobs.index');
    Route::post('jobs/post-jobs', [PostJobsController::class, 'store'])->name('post-jobs.store');
    Route::get('jobs/post-jobs/{id}', [PostJobsController::class, 'show'])->name('post-jobs.show');
    Route::put('jobs/post-jobs/{id}', [PostJobsController::class, 'update'])->name('post-jobs.update');
    Route::patch('jobs/post-jobs/{id}/availability', [PostJobsController::class, 'updateAvailability'])->name('post-jobs.availability');
    Route::delete('jobs/post-jobs/{id}', [PostJobsController::class, 'destroy'])->name('post-jobs.destroy');
    Route::get('user-management/employer-account', [EmployerAccountController::class, 'index'])->name('employer-account.index');
    Route::patch('user-management/employer-account/{user}/toggle-status', [EmployerAccountController::class, 'toggleStatus'])->name('employer-account.toggle-status');
    Route::patch('user-management/employer-account/{user}/business-status', [EmployerAccountController::class, 'updateBusinessStatus'])->name('employer-account.business-status');
    Route::get('user-management/employer-account/{user}/edit', [EmployerAccountController::class, 'edit'])->name('employer-account.edit');
    Route::put('user-management/employer-account/{user}', [EmployerAccountController::class, 'update'])->name('employer-account.update');
    Route::delete('user-management/employer-account/{user}', [EmployerAccountController::class, 'destroy'])->name('employer-account.destroy');
});

require __DIR__.'/settings.php';
