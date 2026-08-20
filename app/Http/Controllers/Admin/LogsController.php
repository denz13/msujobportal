<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\EmailLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LogsController extends Controller
{
    /**
     * Display activity logs and email logs.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $activeTab = $request->get('tab', 'activity'); // 'activity' or 'email'
        $perPage = (int) $request->get('per_page', 15);
        $search = trim($request->get('search', ''));

        // Activity Logs Query
        $activityQuery = ActivityLog::with(['user:id,firstname,lastname,email,role,photo'])
            ->orderByDesc('created_at');

        if ($activeTab === 'activity' && ! empty($search)) {
            $activityQuery->where(function ($q) use ($search) {
                $q->where('event', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('loggable_type', 'LIKE', "%{$search}%")
                    ->orWhere('ip_address', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        $activityLogs = $activityQuery->paginate($perPage, ['*'], 'activity_page')->withQueryString();

        // Email Logs Query
        $emailQuery = EmailLog::with([
            'recipient:id,firstname,lastname,email,role,photo',
            'sender:id,firstname,lastname,email,role',
        ])->orderByDesc('created_at');

        if ($activeTab === 'email' && ! empty($search)) {
            $emailQuery->where(function ($q) use ($search) {
                $q->where('recipient_email', 'LIKE', "%{$search}%")
                    ->orWhere('recipient_name', 'LIKE', "%{$search}%")
                    ->orWhere('subject', 'LIKE', "%{$search}%")
                    ->orWhere('mail_type', 'LIKE', "%{$search}%")
                    ->orWhere('status', 'LIKE', "%{$search}%")
                    ->orWhereHas('recipient', function ($rq) use ($search) {
                        $rq->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('sender', function ($sq) use ($search) {
                        $sq->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        $emailLogs = $emailQuery->paginate($perPage, ['*'], 'email_page')->withQueryString();

        return Inertia::render('admin/logs/index', [
            'activeTab' => $activeTab,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'activityLogs' => [
                'data' => $activityLogs->items(),
                'pagination' => [
                    'links' => $activityLogs->linkCollection()->toArray(),
                    'from' => $activityLogs->firstItem(),
                    'to' => $activityLogs->lastItem(),
                    'total' => $activityLogs->total(),
                    'current_page' => $activityLogs->currentPage(),
                ],
            ],
            'emailLogs' => [
                'data' => $emailLogs->items(),
                'pagination' => [
                    'links' => $emailLogs->linkCollection()->toArray(),
                    'from' => $emailLogs->firstItem(),
                    'to' => $emailLogs->lastItem(),
                    'total' => $emailLogs->total(),
                    'current_page' => $emailLogs->currentPage(),
                ],
            ],
            'stats' => [
                'total_activity_logs' => ActivityLog::count(),
                'total_email_logs' => EmailLog::count(),
                'total_sent_emails' => EmailLog::where('status', 'sent')->count(),
                'total_failed_emails' => EmailLog::where('status', 'failed')->count(),
            ],
        ]);
    }
}
