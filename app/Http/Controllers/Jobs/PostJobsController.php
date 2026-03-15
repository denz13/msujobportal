<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\post_jobs;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PostJobsController extends Controller
{
    /**
     * List jobs with pagination, search and filter.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');

        $query = post_jobs::query()->orderByDesc('created_at');

        if (Auth::check() && Auth::user()->role === 'employer') {
            $query->where('user_id', Auth::id());
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('job_title', 'like', "%{$search}%")
                    ->orWhere('job_category', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        $jobs = $paginator->getCollection()->map(fn (post_jobs $job) => [
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
        ])->values()->all();

        $uniqueStatuses = post_jobs::query()
            ->when(Auth::check() && Auth::user()->role === 'employer', fn ($q) => $q->where('user_id', Auth::id()))
            ->whereNotNull('status')
            ->distinct()
            ->pluck('status')
            ->sort()
            ->values()
            ->all();

        return Inertia::render('jobs/post-jobs', [
            'jobs' => $jobs,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'uniqueStatuses' => $uniqueStatuses,
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
     * Return a single job (for edit modal).
     */
    public function show(int $id): JsonResponse
    {
        $post_job = post_jobs::query()->findOrFail($id);
        $this->authorizeJob($post_job);

        return response()->json([
            'id' => $post_job->id,
            'job_title' => $post_job->job_title,
            'job_description' => $post_job->job_description,
            'job_category' => $post_job->job_category,
            'required_qualifications' => $post_job->required_qualifications,
            'location' => $post_job->location,
            'salary' => $post_job->salary,
            'number_of_vacancies' => $post_job->number_of_vacancies,
            'status' => $post_job->status,
            'photo' => $post_job->photo,
        ]);
    }

    /**
     * Store a newly created job. Photo is saved to public/uploads/jobs.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateJob($request);

        $photoPath = $this->storePhoto($request);
        $validated['photo'] = $photoPath;
        $validated['status'] = 'pending';
        if (Auth::check()) {
            $validated['user_id'] = Auth::id();
        }

        $job = post_jobs::query()->create($validated);

        $this->notifyAdminsNewJobPost($job->job_title, $job->id, 'posted');

        return redirect()->route('post-jobs.index')->with('toast', [
            'type' => 'success',
            'message' => 'Job posted successfully.',
        ]);
    }

    /**
     * Update the specified job.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $post_job = post_jobs::query()->findOrFail($id);
        $this->authorizeJob($post_job);
        $validated = $this->validateJob($request);

        if ($request->hasFile('photo')) {
            $photoPath = $this->storePhoto($request);
            $validated['photo'] = $photoPath;
            if ($post_job->photo && file_exists(public_path($post_job->photo))) {
                @unlink(public_path($post_job->photo));
            }
        }

        $validated['status'] = 'pending';
        $post_job->update($validated);

        $this->notifyAdminsNewJobPost($post_job->job_title, $post_job->id, 'updated');

        return redirect()->route('post-jobs.index')->with('toast', [
            'type' => 'success',
            'message' => 'Job updated successfully.',
        ]);
    }

    /**
     * Remove the specified job.
     */
    public function destroy(int $id): JsonResponse
    {
        $post_job = post_jobs::query()->findOrFail($id);
        $this->authorizeJob($post_job);

        if ($post_job->photo && file_exists(public_path($post_job->photo))) {
            @unlink(public_path($post_job->photo));
        }
        $post_job->delete();

        return response()->json([
            'message' => 'Job deleted successfully.',
        ]);
    }

    /**
     * Toggle job availability: ON = pending, OFF = not_available.
     */
    public function updateAvailability(Request $request, int $id): JsonResponse
    {
        $post_job = post_jobs::query()->findOrFail($id);
        $this->authorizeJob($post_job);

        $request->validate([
            'available' => 'required|boolean',
        ]);

        $post_job->status = $request->boolean('available') ? 'pending' : 'not_available';
        $post_job->save();

        return response()->json([
            'message' => $post_job->status === 'pending'
                ? 'Job is now available (pending approval).'
                : 'Job is now not available.',
            'status' => $post_job->status,
        ]);
    }

    private function authorizeJob(post_jobs $job): void
    {
        if (Auth::check() && Auth::user()->role === 'employer' && (int) $job->user_id !== Auth::id()) {
            abort(403);
        }
    }

    private function validateJob(Request $request): array
    {
        return $request->validate([
            'job_title' => 'required|string|max:255',
            'job_description' => 'required|string',
            'job_category' => 'required|string|max:255',
            'required_qualifications' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'salary' => 'nullable|string|max:255',
            'number_of_vacancies' => 'nullable|integer|min:1',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);
    }

    /**
     * Notify all admin users about a new or updated job post (pending approval).
     */
    private function notifyAdminsNewJobPost(string $jobTitle, int $jobId, string $action): void
    {
        $admins = User::query()->where('role', 'admin')->get();
        $verb = $action === 'posted' ? 'posted' : 'updated';
        $title = "Job {$verb} for approval";
        $message = sprintf(
            'A job has been %s and is pending approval: "%s".',
            $verb,
            $jobTitle
        );
        $actionUrl = '/jobs/list-request-jobs-post';

        /** @var User $admin */
        foreach ($admins as $admin) {
            $admin->notify(new SystemNotification($title, $message, $actionUrl, 'info', [
                'job_id' => $jobId,
                'job_title' => $jobTitle,
            ]));
        }
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }
        $file = $request->file('photo');
        $dir = 'uploads/jobs';
        $path = public_path($dir);
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
        $name = 'job_'.time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $file->move($path, $name);

        return $dir.'/'.$name;
    }
}
