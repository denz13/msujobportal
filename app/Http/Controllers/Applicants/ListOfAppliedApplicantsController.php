<?php

namespace App\Http\Controllers\Applicants;

use App\Http\Controllers\Controller;
use App\Models\job_applications;
use App\Notifications\SystemNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ListOfAppliedApplicantsController extends Controller
{
    /**
     * List applicants who applied to the authenticated employer's job posts.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'employer') {
            return Inertia::render('applicants/list-of-applied-applicants', [
                'applicants' => [],
                'pagination' => [
                    'links' => [],
                    'from' => null,
                    'to' => null,
                    'total' => 0,
                    'current_page' => 1,
                ],
                'filters' => ['search' => '', 'status' => 'all'],
                'uniqueStatuses' => [],
            ]);
        }

        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');

        $baseQuery = job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $user->id));

        if ($status !== 'all' && $status !== '') {
            $baseQuery->where('status', $status);
        }

        if ($search !== '') {
            $baseQuery->whereHas('user', function ($q) use ($search) {
                $q->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $uniqueStatuses = job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $user->id))
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->pluck('status')
            ->sort()
            ->values()
            ->all();

        $applications = $baseQuery
            ->with([
                'user' => fn ($q) => $q->select([
                    'id',
                    'firstname', 'middlename', 'lastname', 'suffix',
                    'gender', 'date_of_birth', 'age', 'address', 'email',
                    'role', 'photo', 'status',
                ]),
                'user.jobSeekerOtherInformation',
                'job:id,job_title',
            ])
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $applicants = $applications->getCollection()->map(fn ($a) => [
            'id' => $a->id,
            'jobseeker' => [
                'display_name' => $a->user?->display_name ?? '',
                'firstname' => $a->user?->firstname ?? '',
                'middlename' => $a->user?->middlename ?? '',
                'lastname' => $a->user?->lastname ?? '',
                'suffix' => $a->user?->suffix ?? '',
                'gender' => $a->user?->gender ?? '',
                'date_of_birth' => $a->user?->date_of_birth ?? null,
                'age' => $a->user?->age ?? null,
                'address' => $a->user?->address ?? '',
                'email' => $a->user?->email ?? '',
                'role' => $a->user?->role ?? '',
                'photo' => $a->user?->photo ?? null,
                'status' => $a->user?->status ?? '',
                'other_info' => $a->user?->jobSeekerOtherInformation ? [
                    'skills' => $a->user->jobSeekerOtherInformation->skills ?? '',
                    'work' => $a->user->jobSeekerOtherInformation->work ?? '',
                    'status' => $a->user->jobSeekerOtherInformation->status ?? '',
                ] : null,
            ],
            'job_title' => $a->job?->job_title ?? '',
            'applied_at' => $a->created_at?->format('c') ?? null,
            'status' => $a->status ?? null,
            'resume_path' => $a->resume_path ?? null,
            'description' => $a->description ?? null,
        ])->values()->all();

        return Inertia::render('applicants/list-of-applied-applicants', [
            'applicants' => $applicants,
            'pagination' => [
                'links' => $applications->linkCollection()->toArray(),
                'from' => $applications->firstItem(),
                'to' => $applications->lastItem(),
                'total' => $applications->total(),
                'current_page' => $applications->currentPage(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'uniqueStatuses' => $uniqueStatuses,
        ]);
    }

    /**
     * Approve an application. Notifies the applicant.
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'employer') {
            abort(403);
        }

        $application = job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $user->id))
            ->with(['user', 'job:id,job_title'])
            ->findOrFail($id);

        $application->update(['status' => 'approved']);

        $applicant = $application->user;
        if ($applicant) {
            $applicant->notify(new SystemNotification(
                'Application approved',
                sprintf(
                    'Your application for "%s" has been approved by the employer.',
                    $application->job?->job_title ?? 'the job'
                ),
                '/applications', // or a route to jobseeker's applications if exists
                'success',
                ['application_id' => $application->id]
            ));
        }

        return redirect()->route('list-of-applied-applicants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Application approved. Applicant has been notified.']);
    }

    /**
     * Decline an application: set status to cancelled, save remarks. Notifies the applicant.
     */
    public function decline(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'employer') {
            abort(403);
        }

        $validated = $request->validate(['remarks' => 'nullable|string|max:1000']);

        $application = job_applications::query()
            ->whereHas('job', fn ($q) => $q->where('user_id', $user->id))
            ->with(['user', 'job:id,job_title'])
            ->findOrFail($id);

        $application->update([
            'status' => 'cancelled',
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $applicant = $application->user;
        if ($applicant) {
            $message = sprintf(
                'Your application for "%s" has been declined.',
                $application->job?->job_title ?? 'the job'
            );
            if (! empty(trim($validated['remarks'] ?? ''))) {
                $message .= ' Remarks: ' . trim($validated['remarks']);
            }
            $applicant->notify(new SystemNotification(
                'Application declined',
                $message,
                '/applications',
                'warning',
                ['application_id' => $application->id]
            ));
        }

        return redirect()->route('list-of-applied-applicants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Application declined. Applicant has been notified.']);
    }
}
