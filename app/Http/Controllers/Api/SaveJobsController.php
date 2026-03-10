<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\post_jobs;
use App\Models\save_jobs;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaveJobsController extends Controller
{
    /**
     * List saved jobs for user (mobile app).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userId = (int) $validated['user_id'];

        $items = save_jobs::query()
            ->with(['job.user:id,firstname,lastname'])
            ->where('users_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (save_jobs $saved) {
                $job = $saved->relationLoaded('job') ? $saved->job : null;
                if (! $job) {
                    return null;
                }

                $user = $job->relationLoaded('user') ? $job->user : null;
                $employerName = $user
                    ? trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? ''))
                    : null;

                return [
                    'saved_id' => $saved->id,
                    'saved_at' => $saved->created_at?->toISOString(),
                    'job' => [
                        'id' => $job->id,
                        'job_title' => $job->job_title,
                        'job_category' => $job->job_category,
                        'location' => $job->location,
                        'salary' => $job->salary,
                        'number_of_vacancies' => $job->number_of_vacancies,
                        'photo' => $job->photo,
                        'created_at' => $job->created_at?->toISOString(),
                        'employer_name' => $employerName ?: null,
                        'status' => $job->status,
                    ],
                ];
            })
            ->filter()
            ->values()
            ->all();

        return response()->json([
            'saved_jobs' => $items,
        ]);
    }

    /**
     * Return total saved jobs count for user.
     */
    public function count(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $count = save_jobs::query()
            ->where('users_id', (int) $validated['user_id'])
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }

    /**
     * Save a job for a job seeker.
     */
    public function store(Request $request, post_jobs $job): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can save jobs.'], 403);
        }

        if ((string) $job->status !== 'approved') {
            return response()->json(['message' => 'Job is not available.'], 403);
        }

        $existing = save_jobs::withTrashed()
            ->where('users_id', $user->id)
            ->where('post_jobs_id', $job->id)
            ->first();

        if ($existing) {
            if (method_exists($existing, 'restore') && $existing->trashed()) {
                $existing->restore();
            }
            $existing->status = $existing->status ?? 'saved';
            $existing->save();
        } else {
            save_jobs::query()->create([
                'users_id' => $user->id,
                'post_jobs_id' => $job->id,
                'status' => 'saved',
            ]);
        }

        return response()->json([
            'message' => 'Saved.',
        ]);
    }

    /**
     * Unsave (remove) a saved job for a job seeker.
     */
    public function destroy(Request $request, post_jobs $job): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);

        if ($user->role !== 'jobseeker') {
            return response()->json(['message' => 'Only job seekers can unsave jobs.'], 403);
        }

        $saved = save_jobs::query()
            ->where('users_id', $user->id)
            ->where('post_jobs_id', $job->id)
            ->first();

        if (! $saved) {
            return response()->json(['message' => 'Not saved.'], 404);
        }

        $saved->delete();

        return response()->json([
            'message' => 'Unsaved.',
        ]);
    }
}

