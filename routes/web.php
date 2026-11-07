<?php

use App\Http\Controllers\Accounts\AccountController;
use App\Http\Controllers\Applicants\ListOfAppliedApplicantsController;
use App\Http\Controllers\Jobs\JobCategoryController;
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
    $jobCategoryNames = \App\Models\JobCategory::query()
        ->where('is_active', true)
        ->pluck('name');

    $usedCategoryNames = post_jobs::query()
        ->whereNotNull('job_category')
        ->where('job_category', '!=', '')
        ->distinct()
        ->pluck('job_category');

    $categories = $jobCategoryNames
        ->concat($usedCategoryNames)
        ->map(fn ($name) => trim((string) $name))
        ->filter(fn ($name) => $name !== '')
        ->unique(fn ($name) => strtolower($name))
        ->sort(fn ($a, $b) => strcasecmp($a, $b))
        ->values()
        ->all();

    $availableJobs = post_jobs::query()
        ->whereIn('status', ['approved', 'active'])
        ->with('user:id,firstname,lastname,photo')
        ->orderByDesc('created_at')
        ->get()
        ->map(fn ($job) => [
            'id' => $job->id,
            'job_title' => $job->job_title,
            'job_description' => $job->job_description,
            'job_category' => $job->job_category,
            'required_qualifications' => $job->required_qualifications,
            'location' => $job->location,
            'salary' => $job->salary,
            'number_of_vacancies' => $job->number_of_vacancies,
            'status' => $job->status,
            'photo' => $job->photo,
            'created_at' => $job->created_at?->toISOString(),
            'employer_name' => $job->user ? trim(($job->user->firstname ?? '') . ' ' . ($job->user->lastname ?? '')) : null,
        ])
        ->values()
        ->all();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'availableJobs' => $availableJobs,
        'categories' => $categories,
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

        // Top 10 locations with most jobs for this employer
        $topLocations = post_jobs::query()
            ->where('user_id', $userId)
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->selectRaw('location, count(*) as total_jobs, sum(number_of_vacancies) as total_vacancies')
            ->groupBy('location')
            ->orderByDesc('total_jobs')
            ->limit(10)
            ->get()
            ->map(fn ($l) => [
                'location' => $l->location,
                'total_jobs' => (int) $l->total_jobs,
                'total_vacancies' => (int) ($l->total_vacancies ?? 0),
            ])
            ->values()
            ->all();

        // Top 10 jobs by location / demand for this employer
        $topJobsByLocation = post_jobs::query()
            ->where('user_id', $userId)
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->withCount('applications')
            ->orderByDesc('applications_count')
            ->orderByDesc('number_of_vacancies')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($j) => [
                'id' => $j->id,
                'job_title' => $j->job_title,
                'job_category' => $j->job_category ?? 'General',
                'location' => $j->location,
                'salary' => $j->salary ?? '—',
                'number_of_vacancies' => $j->number_of_vacancies ?? 1,
                'status' => $j->status ?? 'pending',
                'applications_count' => (int) ($j->applications_count ?? 0),
                'created_at' => $j->created_at?->format('M d, Y') ?? '—',
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard-employer', [
            'stats' => $stats,
            'applicationStats' => $applicationStats,
            'totalJobseekers' => $totalJobseekers,
            'topJobsByLocation' => $topJobsByLocation,
            'topLocations' => $topLocations,
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

    // Top 10 locations with most jobs overall across platform
    $topLocations = post_jobs::query()
        ->whereNotNull('location')
        ->where('location', '!=', '')
        ->selectRaw('location, count(*) as total_jobs, sum(number_of_vacancies) as total_vacancies')
        ->groupBy('location')
        ->orderByDesc('total_jobs')
        ->limit(10)
        ->get()
        ->map(fn ($l) => [
            'location' => $l->location,
            'total_jobs' => (int) $l->total_jobs,
            'total_vacancies' => (int) ($l->total_vacancies ?? 0),
        ])
        ->values()
        ->all();

    // Top 10 jobs by location / demand overall across platform
    $topJobsByLocation = post_jobs::query()
        ->whereNotNull('location')
        ->where('location', '!=', '')
        ->withCount('applications')
        ->with('user:id,firstname,lastname')
        ->orderByDesc('applications_count')
        ->orderByDesc('number_of_vacancies')
        ->orderByDesc('created_at')
        ->limit(10)
        ->get()
        ->map(fn ($j) => [
            'id' => $j->id,
            'job_title' => $j->job_title,
            'job_category' => $j->job_category ?? 'General',
            'location' => $j->location,
            'salary' => $j->salary ?? '—',
            'number_of_vacancies' => $j->number_of_vacancies ?? 1,
            'status' => $j->status ?? 'pending',
            'applications_count' => (int) ($j->applications_count ?? 0),
            'employer_name' => $j->user ? trim(($j->user->firstname ?? '') . ' ' . ($j->user->lastname ?? '')) : '—',
            'created_at' => $j->created_at?->format('M d, Y') ?? '—',
        ])
        ->values()
        ->all();

    return Inertia::render('dashboard', [
        'employers' => $employers,
        'topJobsByLocation' => $topJobsByLocation,
        'topLocations' => $topLocations,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('jobs/list-request-jobs-post', [ListRequestJobsPostController::class, 'index'])->name('list-request-jobs-post.index');
    Route::patch('jobs/list-request-jobs-post/{id}/approve', [ListRequestJobsPostController::class, 'approve'])->name('list-request-jobs-post.approve');
    Route::patch('jobs/list-request-jobs-post/{id}/decline', [ListRequestJobsPostController::class, 'decline'])->name('list-request-jobs-post.decline');
    Route::get('jobs/categories', [JobCategoryController::class, 'index'])->name('job-categories.index');
    Route::post('jobs/categories', [JobCategoryController::class, 'store'])->name('job-categories.store');
    Route::put('jobs/categories/{id}', [JobCategoryController::class, 'update'])->name('job-categories.update');
    Route::patch('jobs/categories/{id}/toggle-status', [JobCategoryController::class, 'toggleStatus'])->name('job-categories.toggle-status');
    Route::delete('jobs/categories/{id}', [JobCategoryController::class, 'destroy'])->name('job-categories.destroy');
    Route::get('jobs/post-jobs', [PostJobsController::class, 'index'])->name('post-jobs.index');
    Route::post('jobs/post-jobs', [PostJobsController::class, 'store'])->name('post-jobs.store');
    Route::get('jobs/post-jobs/{id}', [PostJobsController::class, 'show'])->name('post-jobs.show');
    Route::put('jobs/post-jobs/{id}', [PostJobsController::class, 'update'])->name('post-jobs.update');
    Route::patch('jobs/post-jobs/{id}/availability', [PostJobsController::class, 'updateAvailability'])->name('post-jobs.availability');
    Route::delete('jobs/post-jobs/{id}', [PostJobsController::class, 'destroy'])->name('post-jobs.destroy');
    Route::get('employer/dashboard-items', function (\Illuminate\Http\Request $request) {
        $user = Auth::user();
        if (! $user || $user->role !== 'employer') {
            abort(403);
        }

        $type = $request->get('type', 'jobs');
        $status = $request->get('status', 'all');

        if ($type === 'jobs') {
            $query = post_jobs::query()->where('user_id', $user->id);
            if ($status !== 'all' && $status !== '') {
                $query->where('status', $status);
            }
            $jobs = $query->orderByDesc('created_at')->get();
            return response()->json([
                'type' => 'jobs',
                'items' => $jobs->map(fn ($j) => [
                    'id' => $j->id,
                    'title' => $j->job_title,
                    'category' => $j->job_category ?? '—',
                    'location' => $j->location ?? '—',
                    'vacancies' => $j->number_of_vacancies ?? 1,
                    'status' => $j->status ?? 'pending',
                    'created_at' => $j->created_at?->format('c') ?? null,
                ]),
            ]);
        }

        if ($type === 'jobseekers') {
            $applications = job_applications::whereHas('job', fn ($q) => $q->where('user_id', $user->id))
                ->with(['user:id,firstname,lastname,email,photo'])
                ->orderByDesc('created_at')
                ->get();

            $uniqueJobseekers = $applications->unique('users_id')->map(fn ($a) => [
                'id' => $a->user?->id ?? $a->id,
                'name' => $a->user?->display_name ?? '—',
                'email' => $a->user?->email ?? '—',
                'photo' => $a->user?->photo ?? null,
                'last_applied' => $a->created_at?->format('c') ?? null,
            ])->values();

            return response()->json([
                'type' => 'jobseekers',
                'items' => $uniqueJobseekers,
            ]);
        }

        if ($type === 'applications') {
            $query = job_applications::whereHas('job', fn ($q) => $q->where('user_id', $user->id))
                ->with(['user:id,firstname,lastname,email,photo', 'job:id,job_title']);

            if ($status !== 'all' && $status !== '') {
                $query->where('status', $status);
            }

            $applications = $query->orderByDesc('created_at')->get();
            return response()->json([
                'type' => 'applications',
                'items' => $applications->map(fn ($a) => [
                    'id' => $a->id,
                    'jobseeker' => [
                        'display_name' => $a->user?->display_name ?? '',
                        'email' => $a->user?->email ?? '',
                        'photo' => $a->user?->photo ?? null,
                    ],
                    'job_title' => $a->job?->job_title ?? '',
                    'applied_at' => $a->created_at?->format('c') ?? null,
                    'status' => $a->status ?? null,
                ]),
            ]);
        }

        return response()->json(['items' => []]);
    })->name('employer.dashboard-items');

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

    Route::get('accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::put('accounts/{user}', [AccountController::class, 'update'])->name('accounts.update');
    Route::patch('accounts/{user}/toggle-status', [AccountController::class, 'toggleStatus'])->name('accounts.toggle-status');
    Route::delete('accounts/{user}', [AccountController::class, 'destroy'])->name('accounts.destroy');

    Route::get('user-management/employer-account', [EmployerAccountController::class, 'index'])->name('employer-account.index');
    Route::patch('user-management/employer-account/{user}/toggle-status', [EmployerAccountController::class, 'toggleStatus'])->name('employer-account.toggle-status');
    Route::patch('user-management/employer-account/{user}/business-status', [EmployerAccountController::class, 'updateBusinessStatus'])->name('employer-account.business-status');
    Route::get('user-management/employer-account/{user}/edit', [EmployerAccountController::class, 'edit'])->name('employer-account.edit');
    Route::put('user-management/employer-account/{user}', [EmployerAccountController::class, 'update'])->name('employer-account.update');
    Route::delete('user-management/employer-account/{user}', [EmployerAccountController::class, 'destroy'])->name('employer-account.destroy');

    Route::get('user-management/business-categories', [\App\Http\Controllers\UserManagement\BusinessCategoryController::class, 'index'])->name('business-categories.index');
    Route::post('user-management/business-categories', [\App\Http\Controllers\UserManagement\BusinessCategoryController::class, 'store'])->name('business-categories.store');
    Route::put('user-management/business-categories/{id}', [\App\Http\Controllers\UserManagement\BusinessCategoryController::class, 'update'])->name('business-categories.update');
    Route::patch('user-management/business-categories/{id}/toggle-status', [\App\Http\Controllers\UserManagement\BusinessCategoryController::class, 'toggleStatus'])->name('business-categories.toggle-status');
    Route::delete('user-management/business-categories/{id}', [\App\Http\Controllers\UserManagement\BusinessCategoryController::class, 'destroy'])->name('business-categories.destroy');

    Route::get('admin/logs', [\App\Http\Controllers\Admin\LogsController::class, 'index'])->name('admin.logs.index');
    Route::get('reports', [\App\Http\Controllers\Reports\ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/pdf', [\App\Http\Controllers\Reports\ReportController::class, 'pdf'])->name('reports.pdf');
});

require __DIR__.'/settings.php';
