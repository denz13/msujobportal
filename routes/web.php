<?php

use App\Http\Controllers\Applicants\ListOfAppliedApplicantsController;
use App\Http\Controllers\Jobs\ListRequestJobsPostController;
use App\Http\Controllers\Jobs\PostJobsController;
use App\Http\Controllers\Notifications\NotificationController;
use App\Http\Controllers\UserManagement\EmployerAccountController;
use App\Models\job_applications;
use App\Models\post_jobs;
use App\Models\User;
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
        $applicationsBase = job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $userId))
            ->select('status');
        $total = (clone $applicationsBase)->count();
        $byStatus = (clone $applicationsBase)->get()
            ->groupBy(fn ($row) => $row->status ?? '')
            ->map->count()
            ->all();
        $applicationStats = [
            'total' => $total,
            'by_status' => $byStatus,
        ];
        $totalJobseekers = (int) job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $userId))
            ->selectRaw('COUNT(DISTINCT users_id) as total')
            ->value('total');
        return Inertia::render('dashboard-employer', [
            'stats' => $stats,
            'applicationStats' => $applicationStats,
            'totalJobseekers' => $totalJobseekers,
        ]);
    }
    $employers = User::where('role', 'employer')
        ->with('employerInformation')
        ->select([
            'id',
            'firstname',
            'middlename',
            'lastname',
            'suffix',
            'email',
            'role',
            'status',
            'photo',
            'created_at',
            'updated_at',
        ])
        ->orderBy('created_at', 'desc')
        ->get();

    $employers->transform(function ($employer) {
        $employer->has_incomplete_info = false;
        $employer->has_complete_info = false;
        if ($employer->employerInformation) {
            $employer->has_incomplete_info = ! $employer->employerInformation->isComplete();
            $employer->has_complete_info = $employer->employerInformation->isComplete();
        } else {
            $employer->has_incomplete_info = true;
        }
        $employer->applications_count = job_applications::whereHas(
            'job',
            fn ($q) => $q->where('user_id', $employer->id)
        )->count();
        return $employer;
    });

    return Inertia::render('dashboard', [
        'employers' => $employers,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('jobs/list-request-jobs-post', [ListRequestJobsPostController::class, 'index'])->name('list-request-jobs-post.index');
    Route::patch('jobs/list-request-jobs-post/{id}/approve', [ListRequestJobsPostController::class, 'approve'])->name('list-request-jobs-post.approve');
    Route::patch('jobs/list-request-jobs-post/{id}/decline', [ListRequestJobsPostController::class, 'decline'])->name('list-request-jobs-post.decline');
    Route::get('jobs/post-jobs', [PostJobsController::class, 'index'])->name('post-jobs.index');
    Route::post('jobs/post-jobs', [PostJobsController::class, 'store'])->name('post-jobs.store');
    Route::get('jobs/post-jobs/{id}', [PostJobsController::class, 'show'])->name('post-jobs.show');
    Route::put('jobs/post-jobs/{id}', [PostJobsController::class, 'update'])->name('post-jobs.update');
    Route::patch('jobs/post-jobs/{id}/availability', [PostJobsController::class, 'updateAvailability'])->name('post-jobs.availability');
    Route::delete('jobs/post-jobs/{id}', [PostJobsController::class, 'destroy'])->name('post-jobs.destroy');
    Route::get('employer-applicants/{user}', function (User $user) {
        if ($user->role !== 'employer') {
            abort(404);
        }
        $applications = job_applications::whereHas(
            'job',
            fn ($q) => $q->where('user_id', $user->id)
        )
            ->with(['user:id,firstname,lastname,email,photo', 'job:id,job_title'])
            ->get();

        return response()->json(
            $applications->map(fn ($a) => [
                'id' => $a->id,
                'jobseeker' => [
                    'display_name' => $a->user?->display_name ?? '',
                    'email' => $a->user?->email ?? '',
                    'photo' => $a->user?->photo ?? null,
                ],
                'job_title' => $a->job?->job_title ?? '',
                'applied_at' => $a->created_at?->format('c') ?? null,
                'status' => $a->status ?? null,
            ])
        );
    })->name('employer-applicants.index');
    Route::get('applicants/list-of-applied-applicants', [ListOfAppliedApplicantsController::class, 'index'])->name('list-of-applied-applicants.index');
    Route::patch('applicants/list-of-applied-applicants/{id}/approve', [ListOfAppliedApplicantsController::class, 'approve'])->name('list-of-applied-applicants.approve');
    Route::patch('applicants/list-of-applied-applicants/{id}/decline', [ListOfAppliedApplicantsController::class, 'decline'])->name('list-of-applied-applicants.decline');
    Route::get('user-management/employer-account', [EmployerAccountController::class, 'index'])->name('employer-account.index');
    Route::patch('user-management/employer-account/{user}/toggle-status', [EmployerAccountController::class, 'toggleStatus'])->name('employer-account.toggle-status');
    Route::patch('user-management/employer-account/{user}/business-status', [EmployerAccountController::class, 'updateBusinessStatus'])->name('employer-account.business-status');
    Route::get('user-management/employer-account/{user}/edit', [EmployerAccountController::class, 'edit'])->name('employer-account.edit');
    Route::put('user-management/employer-account/{user}', [EmployerAccountController::class, 'update'])->name('employer-account.update');
    Route::delete('user-management/employer-account/{user}', [EmployerAccountController::class, 'destroy'])->name('employer-account.destroy');
});

require __DIR__.'/settings.php';
