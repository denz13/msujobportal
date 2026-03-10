<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\post_jobs;
use App\Models\save_jobs;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovedJobsController extends Controller
{
    /**
     * List approved job posts for the mobile app.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 20);
        $limit = max(1, min($limit, 50));
        $userId = $request->query('user_id');
        $userId = is_numeric($userId) ? (int) $userId : null;

        $savedJobIds = [];
        if ($userId) {
            $savedJobIds = save_jobs::query()
                ->where('users_id', $userId)
                ->pluck('post_jobs_id')
                ->all();
        }

        $jobs = post_jobs::query()
            ->with('user:id,firstname,lastname')
            ->where('status', 'approved')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (post_jobs $job) {
                $user = $job->relationLoaded('user') ? $job->user : null;
                $employerName = $user
                    ? trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? ''))
                    : null;

                return [
                    'id' => $job->id,
                    'job_title' => $job->job_title,
                    'job_category' => $job->job_category,
                    'location' => $job->location,
                    'salary' => $job->salary,
                    'number_of_vacancies' => $job->number_of_vacancies,
                    'photo' => $job->photo,
                    'created_at' => $job->created_at?->toISOString(),
                    'employer_name' => $employerName ?: null,
                ];
            })
            ->values()
            ->all();

        if ($savedJobIds !== []) {
            $savedLookup = array_fill_keys($savedJobIds, true);
            $jobs = array_map(function (array $j) use ($savedLookup) {
                $j['is_saved'] = isset($savedLookup[$j['id']]);
                return $j;
            }, $jobs);
        } else {
            $jobs = array_map(function (array $j) {
                $j['is_saved'] = false;
                return $j;
            }, $jobs);
        }

        return response()->json([
            'jobs' => $jobs,
        ]);
    }
}

