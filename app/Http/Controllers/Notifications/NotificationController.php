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

        $notifications = $user->notifications()
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
            'unread_count' => $user->unreadNotifications()->count(),
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
}

