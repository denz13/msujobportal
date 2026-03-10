<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\post_jobs;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListRequestJobsPostController extends Controller
{
    /**
     * List post jobs for admin (filter by status: pending, approved, declined).
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'pending'); // 'all' | 'pending' | 'approved' | 'declined'

        $query = post_jobs::query()
            ->with('user:id,firstname,lastname')
            ->orderByDesc('created_at');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('job_title', 'like', "%{$search}%")
                    ->orWhere('job_category', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        $jobs = $paginator->getCollection()->map(function (post_jobs $job) {
            $user = $job->relationLoaded('user') ? $job->user : null;
            $employerName = $user
                ? trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? ''))
                : null;

            return [
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
                'employer_name' => $employerName ?: null,
            ];
        })->values()->all();

        $filterStatuses = ['pending', 'approved', 'declined'];

        return Inertia::render('jobs/list-request-jobs-post', [
            'jobs' => $jobs,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'uniqueStatuses' => $filterStatuses,
            'pagination' => [
                'links' => $paginator->linkCollection()->toArray(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
            ],
        ]);
    }

    /**
     * Approve a pending job. Sets status to approved and remarks to evaluated.
     */
    public function approve(int $id): JsonResponse
    {
        $job = post_jobs::query()->where('status', 'pending')->findOrFail($id);

        $job->status = 'approved';
        $job->remarks = 'Approved. Your job has been evaluated.';
        $job->save();

        $job->loadMissing('user');
        if ($job->user) {
            $job->user->notify(new SystemNotification(
                title: 'Job post approved',
                message: "Your job post \"{$job->job_title}\" has been approved and evaluated.",
                actionUrl: '/jobs/post-jobs',
                level: 'success',
                meta: ['job_id' => $job->id, 'status' => 'approved'],
            ));
        }

        return response()->json([
            'message' => 'Job approved successfully. It has been marked as evaluated.',
        ]);
    }

    /**
     * Decline a pending job. Requires manual remarks.
     */
    public function decline(Request $request, int $id): JsonResponse
    {
        $job = post_jobs::query()->where('status', 'pending')->findOrFail($id);

        $request->validate([
            'remarks' => 'required|string|max:1000',
        ]);

        $job->status = 'declined';
        $job->remarks = $request->input('remarks');
        $job->save();

        $job->loadMissing('user');
        if ($job->user) {
            $job->user->notify(new SystemNotification(
                title: 'Job post declined',
                message: "Your job post \"{$job->job_title}\" was declined. Remarks: {$job->remarks}",
                actionUrl: '/jobs/post-jobs',
                level: 'error',
                meta: ['job_id' => $job->id, 'status' => 'declined'],
            ));
        }

        return response()->json([
            'message' => 'Job declined. Remarks have been saved.',
        ]);
    }
}
