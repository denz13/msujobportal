<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $limit = (int) $request->get('limit', 10);
        $limit = max(1, min($limit, 30));

        $query = $user->notifications();

        // If the logged in user is an admin, ensure they never see applicant submission notifications intended for employers
        if ($user->role === 'admin') {
            $query->where(function ($q) {
                $q->whereNull('data->meta->type')
                  ->orWhere('data->meta->type', '!=', 'job_application_submitted');
            });
        }

        $unreadCountQuery = $user->unreadNotifications();
        if ($user->role === 'admin') {
            $unreadCountQuery->where(function ($q) {
                $q->whereNull('data->meta->type')
                  ->orWhere('data->meta->type', '!=', 'job_application_submitted');
            });
        }

        $notifications = $query
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (DatabaseNotification $n) {
                return [
                    'id' => $n->id,
                    'read_at' => $n->read_at?->toISOString(),
                    'created_at' => $n->created_at?->toISOString(),
                    'data' => $n->data,
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'unread_count' => $unreadCountQuery->count(),
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->whereKey($id)->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->whereKey($id)->firstOrFail();
        $notification->delete();

        $unreadQuery = $user->unreadNotifications();
        if ($user->role === 'admin') {
            $unreadQuery->where(function ($q) {
                $q->whereNull('data->meta->type')
                  ->orWhere('data->meta->type', '!=', 'job_application_submitted');
            });
        }

        return response()->json([
            'message' => 'Notification deleted.',
            'unread_count' => $unreadQuery->count(),
        ]);
    }
}

