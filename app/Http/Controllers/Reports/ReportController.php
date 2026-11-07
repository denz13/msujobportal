<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\job_applications;
use App\Models\post_jobs;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the applicant reports page.
     * Admin / Super Admin can view all applicants across all employers.
     * Employer can only view applicants who applied to their own jobs.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin', 'employer'], true)) {
            abort(403, 'Unauthorized access to reports.');
        }

        $data = $this->getReportData($request, $user);

        return Inertia::render('reports/index', [
            'applications' => $data['applications'],
            'stats' => $data['stats'],
            'jobs' => $data['jobs'],
            'employers' => $data['employers'],
            'filters' => [
                'search' => $data['search'],
                'job_id' => $data['jobId'],
                'status' => $data['status'],
                'employer_id' => $data['employerId'],
                'date_from' => $data['dateFrom'],
                'date_to' => $data['dateTo'],
            ],
            'isAdmin' => $data['isAdmin'],
            'currentUser' => [
                'name' => $user->display_name ?: trim($user->firstname . ' ' . $user->lastname),
                'role' => $user->role,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Generate or stream the official PDF report using Dompdf.
     */
    public function pdf(Request $request)
    {
        $user = Auth::user();
        if (! $user || ! in_array($user->role, ['admin', 'super_admin', 'employer'], true)) {
            abort(403, 'Unauthorized access to reports.');
        }

        $data = $this->getReportData($request, $user);
        $normalizedApplicants = $this->buildNormalizedApplicants($data['applications']);

        // Human-friendly filter labels for the PDF header
        $jobTitle = null;
        if ($data['jobId'] !== 'all' && $data['jobId'] !== '') {
            $foundJob = collect($data['jobs'])->firstWhere('id', (string) $data['jobId']);
            $jobTitle = $foundJob['title'] ?? null;
        }

        $employerName = null;
        if ($data['isAdmin'] && $data['employerId'] !== 'all' && $data['employerId'] !== '') {
            $foundEmp = collect($data['employers'])->firstWhere('id', (string) $data['employerId']);
            $employerName = $foundEmp['name'] ?? null;
        }

        $filterSummary = [
            'status' => $data['status'],
            'job_title' => $jobTitle,
            'employer_name' => $employerName,
            'date_from' => $data['dateFrom'],
            'date_to' => $data['dateTo'],
            'search' => $data['search'],
        ];

        $viewMode = $request->get('view_mode', 'applications');
        $generatedAt = now()->format('F d, Y h:i A');

        $currentUser = [
            'name' => $user->display_name ?: trim($user->firstname . ' ' . $user->lastname),
            'role' => $user->role,
            'email' => $user->email,
        ];

        $pdf = Pdf::loadView('reports.applications-pdf', [
            'applications' => $data['applications'],
            'normalizedApplicants' => $normalizedApplicants,
            'stats' => $data['stats'],
            'filters' => $filterSummary,
            'isAdmin' => $data['isAdmin'],
            'currentUser' => $currentUser,
            'generatedAt' => $generatedAt,
            'viewMode' => $viewMode,
        ]);

        $pdf->setPaper('a4', 'landscape');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);

        $timestamp = now()->format('Ymd_His');
        $filename = "list_of_applications_{$timestamp}.pdf";

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        // Default: stream PDF inline for browser viewing and printing
        return $pdf->stream($filename);
    }

    /**
     * Shared logic to query and format job applications and filter datasets.
     */
    private function getReportData(Request $request, User $user): array
    {
        $isAdmin = in_array($user->role, ['admin', 'super_admin'], true);

        $search = trim($request->get('search', ''));
        $jobId = $request->get('job_id', 'all');
        $status = $request->get('status', 'all');
        $employerId = $request->get('employer_id', 'all');
        $dateFrom = $request->get('date_from', '');
        $dateTo = $request->get('date_to', '');

        $query = job_applications::query();

        // Scope by role: Employer only sees their own applicants
        if (! $isAdmin) {
            $query->whereHas('job', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($employerId !== 'all' && $employerId !== '') {
            $query->whereHas('job', fn ($q) => $q->where('user_id', (int) $employerId));
        }

        // Filter by job post
        if ($jobId !== 'all' && $jobId !== '') {
            $query->where('post_jobs_id', (int) $jobId);
        }

        // Filter by status
        if ($status !== 'all' && $status !== '') {
            $query->where('status', $status);
        }

        // Filter by date range
        if ($dateFrom !== '') {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo !== '') {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Filter by search keyword (applicant name, email, qualifications, job title)
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                        ->orWhere('email', 'LIKE', "%{$search}%")
                        ->orWhereHas('jobSeekerOtherInformation', function ($sq) use ($search) {
                            $sq->where('skills', 'LIKE', "%{$search}%")
                                ->orWhere('work', 'LIKE', "%{$search}%");
                        });
                })->orWhereHas('job', function ($jq) use ($search) {
                    $jq->where('job_title', 'LIKE', "%{$search}%")
                        ->orWhere('job_category', 'LIKE', "%{$search}%");
                });
            });
        }

        // Calculate summary statistics
        $stats = [
            'total_applications' => (clone $query)->count(),
            'unique_applicants' => (clone $query)->distinct('users_id')->count('users_id'),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'cancelled' => (clone $query)->whereIn('status', ['cancelled', 'declined'])->count(),
        ];

        // Eager load relations for the report
        $applications = $query
            ->with([
                'user' => fn ($q) => $q->select([
                    'id', 'firstname', 'middlename', 'lastname', 'suffix',
                    'email', 'gender', 'age', 'address', 'status',
                ]),
                'user.jobSeekerOtherInformation',
                'job' => fn ($q) => $q->select(['id', 'job_title', 'job_category', 'user_id']),
                'job.user' => fn ($q) => $q->select(['id', 'firstname', 'lastname', 'email']),
                'job.user.employerInformation' => fn ($q) => $q->select(['id', 'users_id', 'type_of_business', 'position', 'business_address']),
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($app) {
                $skills = $app->user?->jobSeekerOtherInformation?->skills;
                $work = $app->user?->jobSeekerOtherInformation?->work;
                $employerName = $app->job?->user
                    ? trim(($app->job->user->firstname ?? '') . ' ' . ($app->job->user->lastname ?? ''))
                    : '—';
                $businessType = $app->job?->user?->employerInformation?->type_of_business;

                return [
                    'id' => $app->id,
                    'user_id' => $app->users_id,
                    'applicant_name' => $app->user?->display_name ?: trim(($app->user?->firstname ?? '') . ' ' . ($app->user?->lastname ?? '')),
                    'email' => $app->user?->email ?? '—',
                    'gender' => $app->user?->gender ?? '—',
                    'age' => $app->user?->age ?? null,
                    'address' => $app->user?->address ?? '—',
                    'qualifications' => $skills ? array_values(array_filter(array_map('trim', explode(',', $skills)))) : [],
                    'qualifications_raw' => $skills ?? 'None',
                    'work_experience' => $work ?? '—',
                    'job_title' => $app->job?->job_title ?? '—',
                    'job_category' => $app->job?->job_category ?? '—',
                    'employer_name' => $employerName,
                    'company_name' => $businessType,
                    'employer_display' => $businessType ? "{$employerName} ({$businessType})" : $employerName,
                    'status' => $app->status ?? 'pending',
                    'applied_at' => $app->created_at?->format('Y-m-d H:i') ?? null,
                    'applied_date_formatted' => $app->created_at?->format('M d, Y') ?? '—',
                    'interview_date' => $app->interview_date?->format('M d, Y') ?? null,
                    'interview_time' => $app->interview_time ?? null,
                    'interview_type' => $app->interview_type ?? null,
                    'remarks' => $app->remarks ?? null,
                ];
            })
            ->values()
            ->all();

        // Jobs list for filter dropdown
        $jobsQuery = post_jobs::query()->orderBy('job_title');
        if (! $isAdmin) {
            $jobsQuery->where('user_id', $user->id);
        }
        $jobs = $jobsQuery->select(['id', 'job_title'])->get()->map(fn ($j) => [
            'id' => (string) $j->id,
            'title' => $j->job_title,
        ])->all();

        // Employers list for Admin filter dropdown
        $employers = [];
        if ($isAdmin) {
            $employers = User::query()
                ->where('role', 'employer')
                ->with('employerInformation:id,users_id,type_of_business')
                ->select(['id', 'firstname', 'lastname'])
                ->orderBy('firstname')
                ->get()
                ->map(fn ($e) => [
                    'id' => (string) $e->id,
                    'name' => $e->employerInformation?->type_of_business
                        ? trim($e->firstname . ' ' . $e->lastname) . " ({$e->employerInformation->type_of_business})"
                        : trim($e->firstname . ' ' . $e->lastname),
                ])
                ->all();
        }

        return [
            'isAdmin' => $isAdmin,
            'search' => $search,
            'jobId' => $jobId,
            'status' => $status,
            'employerId' => $employerId,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'stats' => $stats,
            'applications' => $applications,
            'jobs' => $jobs,
            'employers' => $employers,
        ];
    }

    /**
     * Group applications by applicant for normalized applicant-centric report.
     */
    private function buildNormalizedApplicants(array $applications): array
    {
        $map = [];
        foreach ($applications as $app) {
            $key = $app['user_id']
                ? 'uid-' . $app['user_id']
                : (! empty($app['email']) && $app['email'] !== '—'
                    ? 'email-' . $app['email']
                    : 'name-' . $app['applicant_name']);

            if (! isset($map[$key])) {
                $map[$key] = [
                    'key' => $key,
                    'user_id' => $app['user_id'],
                    'applicant_name' => $app['applicant_name'],
                    'email' => $app['email'],
                    'gender' => $app['gender'],
                    'age' => $app['age'],
                    'address' => $app['address'],
                    'qualifications' => $app['qualifications'],
                    'qualifications_raw' => $app['qualifications_raw'],
                    'work_experience' => $app['work_experience'],
                    'total_applications' => 0,
                    'applications' => [],
                ];
            }

            $map[$key]['total_applications'] += 1;
            $map[$key]['applications'][] = $app;
        }

        return array_values($map);
    }
}
