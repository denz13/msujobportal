<?php

namespace App\Http\Controllers\Applicants;

use App\Http\Controllers\Controller;
use App\Mail\ApplicationStatusMail;
use App\Models\job_applications;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
        if (! $user || ! in_array($user->role, ['employer', 'admin'], true)) {
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

        $perPage = (int) $request->get('per_page', 10);
        $search = trim($request->get('search', ''));
        $status = $request->get('status', 'all');
        $arrangeBy = $request->get('arrange_by', 'latest');

        // Unique statuses available for this role
        $uniqueStatusesQuery = job_applications::query();
        if ($user->role === 'employer') {
            $uniqueStatusesQuery->whereHas('job', fn ($q) => $q->where('user_id', $user->id));
        }

        $uniqueStatuses = $uniqueStatusesQuery
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->pluck('status')
            ->sort()
            ->values()
            ->all();

        // Base query for applicants (Jobseekers who applied to relevant jobs)
        $query = User::query()
            ->whereHas('jobApplications', function ($q) use ($user, $status) {
                if ($user->role === 'employer') {
                    $q->whereHas('job', fn ($jq) => $jq->where('user_id', $user->id));
                }
                if ($status !== 'all' && $status !== '') {
                    $q->where('status', $status);
                }
            });

        // Search by candidate name, email, or qualification/skills/work experience
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhereHas('jobSeekerOtherInformation', function ($oq) use ($search) {
                        $oq->where('skills', 'LIKE', "%{$search}%")
                            ->orWhere('work', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Arrange the job seekers based on qualifications or other criteria
        if ($arrangeBy === 'qualification') {
            $query->leftJoin('job_seeker_other_information', 'users.id', '=', 'job_seeker_other_information.users_id')
                ->select('users.*')
                ->orderByRaw('CASE WHEN job_seeker_other_information.skills IS NOT NULL AND TRIM(job_seeker_other_information.skills) != "" THEN 0 ELSE 1 END')
                ->orderBy('job_seeker_other_information.skills', 'asc');
        } elseif ($arrangeBy === 'name') {
            $query->orderBy('firstname', 'asc')->orderBy('lastname', 'asc');
        } elseif ($arrangeBy === 'applications') {
            $query->withCount(['jobApplications' => function ($q) use ($user, $status) {
                if ($user->role === 'employer') {
                    $q->whereHas('job', fn ($jq) => $jq->where('user_id', $user->id));
                }
                if ($status !== 'all' && $status !== '') {
                    $q->where('status', $status);
                }
            }])->orderByDesc('job_applications_count');
        } else {
            // Latest application by default
            $latestAppSubquery = job_applications::query()
                ->selectRaw('MAX(created_at)')
                ->whereColumn('job_applications.users_id', 'users.id');
            if ($user->role === 'employer') {
                $latestAppSubquery->whereHas('job', fn ($jq) => $jq->where('user_id', $user->id));
            }
            if ($status !== 'all' && $status !== '') {
                $latestAppSubquery->where('status', $status);
            }
            $query->orderByDesc($latestAppSubquery);
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        // Eager load relations for the paginated collection
        $paginator->getCollection()->load([
            'jobSeekerOtherInformation',
            'jobApplications' => function ($q) use ($user, $status) {
                if ($user->role === 'employer') {
                    $q->whereHas('job', fn ($jq) => $jq->where('user_id', $user->id));
                }
                if ($status !== 'all' && $status !== '') {
                    $q->where('status', $status);
                }
                $q->with('job:id,job_title,job_category,required_qualifications')
                    ->orderByDesc('created_at');
            },
        ]);

        $applicants = $paginator->getCollection()->map(function ($seeker) {
            $applications = $seeker->jobApplications->map(fn ($a) => [
                'id' => $a->id,
                'job_id' => $a->post_jobs_id,
                'job_title' => $a->job?->job_title ?? '—',
                'job_category' => $a->job?->job_category ?? '—',
                'job_qualifications' => $a->job?->required_qualifications ?? '—',
                'applied_at' => $a->created_at?->format('c') ?? null,
                'status' => $a->status ?? null,
                'resume_path' => $a->resume_path ?? null,
                'description' => $a->description ?? null,
                'remarks' => $a->remarks ?? null,
            ])->values()->all();

            $skills = $seeker->jobSeekerOtherInformation?->skills;
            $work = $seeker->jobSeekerOtherInformation?->work;

            return [
                'id' => $seeker->id,
                'jobseeker' => [
                    'id' => $seeker->id,
                    'display_name' => $seeker->display_name ?: trim($seeker->firstname . ' ' . $seeker->lastname),
                    'firstname' => $seeker->firstname ?? '',
                    'middlename' => $seeker->middlename ?? '',
                    'lastname' => $seeker->lastname ?? '',
                    'suffix' => $seeker->suffix ?? '',
                    'gender' => $seeker->gender ?? '',
                    'date_of_birth' => $seeker->date_of_birth ?? null,
                    'age' => $seeker->age ?? null,
                    'address' => $seeker->address ?? '',
                    'email' => $seeker->email ?? '',
                    'role' => $seeker->role ?? '',
                    'photo' => $seeker->photo ?? null,
                    'status' => $seeker->status ?? '',
                    'other_info' => $seeker->jobSeekerOtherInformation ? [
                        'skills' => $seeker->jobSeekerOtherInformation->skills ?? '',
                        'work' => $seeker->jobSeekerOtherInformation->work ?? '',
                        'status' => $seeker->jobSeekerOtherInformation->status ?? '',
                    ] : null,
                ],
                'skills' => $skills ? array_values(array_filter(array_map('trim', explode(',', $skills)))) : [],
                'skills_raw' => $skills ?? '',
                'work_experience' => $work ?? '',
                'total_applications' => count($applications),
                'latest_applied_at' => $applications[0]['applied_at'] ?? null,
                'applications' => $applications,
            ];
        })->values()->all();

        return Inertia::render('applicants/list-of-applied-applicants', [
            'applicants' => $applicants,
            'pagination' => [
                'links' => $paginator->linkCollection()->toArray(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'arrange_by' => $arrangeBy,
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
        if (! $user || ! in_array($user->role, ['employer', 'admin'], true)) {
            abort(403);
        }

        $validated = $request->validate([
            'interview_date' => 'nullable|date',
            'interview_time' => 'nullable|string|max:100',
            'interview_type' => 'nullable|string|in:face-to-face,virtual,phone',
            'interview_location' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'interview_instructions' => 'nullable|string|max:2000',
        ]);

        $query = job_applications::query();
        if ($user->role === 'employer') {
            $query->whereHas('job', fn ($q) => $q->where('user_id', $user->id));
        }

        $application = $query->with(['user', 'job:id,job_title,user_id'])
            ->findOrFail($id);

        $application->update([
            'status' => 'approved',
            'interview_date' => $validated['interview_date'] ?? null,
            'interview_time' => $validated['interview_time'] ?? null,
            'interview_type' => $validated['interview_type'] ?? null,
            'interview_location' => $validated['interview_location'] ?? null,
            'contact_person' => $validated['contact_person'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'interview_instructions' => $validated['interview_instructions'] ?? null,
        ]);

        $applicant = $application->user ?: User::find($application->users_id);
        if ($applicant) {
            $jobTitle = $application->job?->job_title ?? 'the job';
            $subjectForSearch = rawurlencode('Congratulations! Your Application has been Approved - ' . $jobTitle);
            $gmailWebUrl = "https://mail.google.com/mail/u/0/#search/{$subjectForSearch}";

            $interviewSummary = '';
            if (!empty($validated['interview_date'])) {
                $interviewSummary .= ' Date: ' . date('M d, Y', strtotime($validated['interview_date']));
            }
            if (!empty($validated['interview_time'])) {
                $interviewSummary .= ' at ' . $validated['interview_time'];
            }
            if (!empty($validated['interview_type'])) {
                $interviewSummary .= ' (' . ucwords(str_replace('_', ' ', $validated['interview_type'])) . ')';
            }

            try {
                $applicant->notify(new SystemNotification(
                    title: 'Application approved',
                    message: sprintf(
                        'Your application for "%s" has been approved!%s Click to view full interview details and open in Gmail.',
                        $jobTitle,
                        $interviewSummary ? " [Interview Schedule:{$interviewSummary}]" : ''
                    ),
                    actionUrl: '/applications',
                    level: 'success',
                    meta: [
                        'type' => 'job_application_status_updated',
                        'status' => 'approved',
                        'application_id' => $application->id,
                        'post_jobs_id' => $application->post_jobs_id,
                        'job_title' => $application->job?->job_title,
                        'employer_id' => $application->job?->user_id ?? $user->id,
                        'interview_date' => $validated['interview_date'] ?? null,
                        'interview_time' => $validated['interview_time'] ?? null,
                        'interview_type' => $validated['interview_type'] ?? null,
                        'interview_location' => $validated['interview_location'] ?? null,
                        'contact_person' => $validated['contact_person'] ?? null,
                        'contact_phone' => $validated['contact_phone'] ?? null,
                        'interview_instructions' => $validated['interview_instructions'] ?? null,
                        'gmail_url' => $gmailWebUrl,
                    ],
                ));
            } catch (\Throwable $e) {
                Log::error('Failed to send application approved notification: ' . $e->getMessage(), [
                    'exception' => $e,
                    'application_id' => $application->id,
                    'applicant_id' => $applicant->id,
                ]);
            }

            if (! empty($applicant->email)) {
                $mailable = new ApplicationStatusMail(
                    applicantName: $applicant->display_name ?: ($applicant->firstname . ' ' . $applicant->lastname),
                    jobTitle: $application->job?->job_title ?? 'Applied Job',
                    status: 'approved',
                    remarks: null,
                    employerName: $user->display_name ?? null,
                    actionUrl: url('/applications'),
                    interviewDate: $validated['interview_date'] ?? null,
                    interviewTime: $validated['interview_time'] ?? null,
                    interviewType: $validated['interview_type'] ?? null,
                    interviewLocation: $validated['interview_location'] ?? null,
                    contactPerson: $validated['contact_person'] ?? null,
                    contactPhone: $validated['contact_phone'] ?? null,
                    interviewInstructions: $validated['interview_instructions'] ?? null
                );

                \App\Models\EmailLog::sendAndLog($applicant, $mailable, [
                    'mail_type' => 'application_approved',
                    'emailable' => $application,
                    'sender_id' => $user->id,
                    'meta' => [
                        'application_id' => $application->id,
                        'post_jobs_id' => $application->post_jobs_id,
                        'job_title' => $application->job?->job_title,
                        'interview_date' => $validated['interview_date'] ?? null,
                        'interview_time' => $validated['interview_time'] ?? null,
                    ],
                ]);
            }
        }

        return redirect()->route('list-of-applied-applicants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Application approved and interview notification sent to applicant via email!']);
    }

    /**
     * Decline an application: set status to cancelled, save remarks. Notifies the applicant.
     */
    public function decline(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['employer', 'admin'], true)) {
            abort(403);
        }

        $validated = $request->validate(['remarks' => 'nullable|string|max:1000']);

        $query = job_applications::query();
        if ($user->role === 'employer') {
            $query->whereHas('job', fn ($q) => $q->where('user_id', $user->id));
        }

        $application = $query->with(['user', 'job:id,job_title'])
            ->findOrFail($id);

        $application->update([
            'status' => 'cancelled',
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $applicant = $application->user ?: User::find($application->users_id);
        if ($applicant) {
            $jobTitle = $application->job?->job_title ?? 'the job';
            $subjectForSearch = rawurlencode('Update on Your Application for ' . $jobTitle);
            $gmailWebUrl = "https://mail.google.com/mail/u/0/#search/{$subjectForSearch}";

            $message = sprintf(
                'Your application for "%s" has been declined.',
                $jobTitle
            );
            if (! empty(trim($validated['remarks'] ?? ''))) {
                $message .= ' Remarks: ' . trim($validated['remarks']);
            }
            try {
                $applicant->notify(new SystemNotification(
                    title: 'Application declined',
                    message: $message,
                    actionUrl: '/applications',
                    level: 'warning',
                    meta: [
                        'type' => 'job_application_status_updated',
                        'status' => 'declined',
                        'application_id' => $application->id,
                        'post_jobs_id' => $application->post_jobs_id,
                        'job_title' => $application->job?->job_title,
                        'employer_id' => $application->job?->user_id ?? $user->id,
                        'remarks' => $validated['remarks'] ?? null,
                        'gmail_url' => $gmailWebUrl,
                    ],
                ));
            } catch (\Throwable $e) {
                Log::error('Failed to send application declined notification: ' . $e->getMessage(), [
                    'exception' => $e,
                    'application_id' => $application->id,
                    'applicant_id' => $applicant->id,
                ]);
            }

            if (! empty($applicant->email)) {
                $mailable = new ApplicationStatusMail(
                    applicantName: $applicant->display_name ?: ($applicant->firstname . ' ' . $applicant->lastname),
                    jobTitle: $application->job?->job_title ?? 'Applied Job',
                    status: 'declined',
                    remarks: $validated['remarks'] ?? null,
                    employerName: $user->display_name ?? null,
                    actionUrl: url('/applications')
                );

                \App\Models\EmailLog::sendAndLog($applicant, $mailable, [
                    'mail_type' => 'application_declined',
                    'emailable' => $application,
                    'sender_id' => $user->id,
                    'meta' => [
                        'application_id' => $application->id,
                        'post_jobs_id' => $application->post_jobs_id,
                        'job_title' => $application->job?->job_title,
                        'remarks' => $validated['remarks'] ?? null,
                    ],
                ]);
            }
        }

        return redirect()->route('list-of-applied-applicants.index')
            ->with('toast', ['type' => 'success', 'message' => 'Application declined. Applicant has been notified via email.']);
    }
}
