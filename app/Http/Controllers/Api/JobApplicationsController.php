<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\job_applications;
use App\Models\post_jobs;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class JobApplicationsController extends Controller
{
    /**
     * Return total applications count for user.
     */
    public function count(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can view applications.'], 403);
        }

        $count = job_applications::query()
            ->where('users_id', $user->id)
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }

    /**
     * List job applications for a job seeker (mobile app).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can view applications.'], 403);
        }

        $limit = isset($validated['limit']) ? (int) $validated['limit'] : 30;

        $items = job_applications::query()
            ->with(['job.user:id,firstname,lastname'])
            ->where('users_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (job_applications $app) {
                $job = $app->relationLoaded('job') ? $app->job : null;
                $employer = $job && $job->relationLoaded('user') ? $job->user : null;
                $employerName = $employer
                    ? trim(($employer->firstname ?? '') . ' ' . ($employer->lastname ?? ''))
                    : null;

                return [
                    'id' => $app->id,
                    'status' => $app->status,
                    'description' => $app->description,
                    'resume_path' => $app->resume_path,
                    'created_at' => $app->created_at?->toISOString(),
                    'job' => $job ? [
                        'id' => $job->id,
                        'job_title' => $job->job_title,
                        'job_category' => $job->job_category,
                        'location' => $job->location,
                        'salary' => $job->salary,
                        'number_of_vacancies' => $job->number_of_vacancies,
                        'photo' => $job->photo,
                        'created_at' => $job->created_at?->toISOString(),
                        'status' => $job->status,
                        'employer_name' => $employerName ?: null,
                    ] : null,
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'applications' => $items,
        ]);
    }

    /**
     * Cancel a job application (job seeker).
     */
    public function cancel(Request $request, job_applications $application): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can cancel applications.'], 403);
        }

        if ((int) $application->users_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $current = strtolower((string) ($application->status ?? ''));
        if ($current === 'cancelled' || $current === 'canceled') {
            return response()->json(['message' => 'Already cancelled.']);
        }

        $application->status = 'cancelled';
        $application->save();

        return response()->json([
            'message' => 'Application cancelled.',
            'application' => [
                'id' => $application->id,
                'status' => $application->status,
            ],
        ]);
    }

    /**
     * Submit a job application with resume upload (mobile app).
     */
    public function store(Request $request, post_jobs $job): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'resume' => ['required', 'file', 'max:5120', 'mimes:pdf,doc,docx'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can apply.'], 403);
        }

        if ((string) $user->status !== 'approved') {
            return response()->json(['message' => 'Account not approved.'], 403);
        }

        if ((string) $job->status !== 'approved') {
            return response()->json(['message' => 'Job is not available.'], 403);
        }

        $resume = $request->file('resume');
        if (! $resume) {
            return response()->json(['message' => 'Resume file is required.'], 422);
        }

        $dir = public_path('uploads/resumes');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $ext = strtolower($resume->getClientOriginalExtension() ?: 'pdf');
        $safeExt = in_array($ext, ['pdf', 'doc', 'docx'], true) ? $ext : 'pdf';
        $filename = 'resume-' . $user->id . '-' . $job->id . '-' . Str::random(10) . '.' . $safeExt;

        $resume->move($dir, $filename);

        $relativePath = 'uploads/resumes/' . $filename;

        $application = job_applications::query()->create([
            'users_id' => $user->id,
            'post_jobs_id' => $job->id,
            'resume_path' => $relativePath,
            'description' => isset($validated['description'])
                ? trim((string) $validated['description'])
                : null,
            'status' => 'submitted',
        ]);

        // Notify the employer (job poster).
        $employerId = (int) ($job->user_id ?? 0);
        if ($employerId > 0 && $employerId !== (int) $user->id) {
            $employer = User::query()->find($employerId);
            if ($employer) {
                try {
                    $employer->notify(new SystemNotification(
                        title: 'New job application',
                        message: trim($user->display_name . ' applied for "' . (string) $job->job_title . '".'),
                        actionUrl: null,
                        level: 'info',
                        meta: [
                            'type' => 'job_application_submitted',
                            'application_id' => $application->id,
                            'post_jobs_id' => $job->id,
                            'employer_id' => $employer->id,
                            'jobseeker_id' => $user->id,
                        ],
                    ));
                } catch (\Throwable $e) {
                    // Do not fail the apply request if notification fails.
                }
            }
        }

        return response()->json([
            'message' => 'Application submitted.',
            'application' => [
                'id' => $application->id,
                'users_id' => $application->users_id,
                'post_jobs_id' => $application->post_jobs_id,
                'resume_path' => $application->resume_path,
                'description' => $application->description,
                'status' => $application->status,
                'created_at' => $application->created_at?->toISOString(),
            ],
        ], 201);
    }
}

