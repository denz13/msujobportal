<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\employer_information;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployerAccountController extends Controller
{
    /**
     * Display a listing of employer accounts.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        
        $query = User::where('role', 'employer')
            ->with('employerInformation')
            ->select([
                'id',
                'firstname',
                'middlename',
                'lastname',
                'suffix',
                'email',
                'role',
                'status',
                'photo',
                'created_at',
                'updated_at',
            ]);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $employers = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Get unique statuses for filter dropdown
        $uniqueStatuses = User::where('role', 'employer')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->pluck('status')
            ->sort()
            ->values();

        // Transform employers data to include completeness check
        $employers->getCollection()->transform(function ($employer) {
            $employer->has_incomplete_info = false;
            $employer->has_complete_info = false;
            
            if ($employer->employerInformation) {
                $employer->has_incomplete_info = !$employer->employerInformation->isComplete();
                $employer->has_complete_info = $employer->employerInformation->isComplete();
            } else {
                $employer->has_incomplete_info = true;
            }
            
            return $employer;
        });

        return Inertia::render('user-management/employer-account', [
            'employers' => $employers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'uniqueStatuses' => $uniqueStatuses,
        ]);
    }

    public function edit(User $user): Response
    {
        abort_unless($user->role === 'employer', 404);

        $user->load('employerInformation');

        return Inertia::render('user-management/employer-account-edit', [
            'employer' => [
                'id' => $user->id,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'status' => $user->status,
            ],
            'employerInformation' => $user->employerInformation,
        ]);
    }

    public function update(Request $request, User $user)
    {
        abort_unless($user->role === 'employer', 404);

        $validated = $request->validate([
            'position' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:255'],
            'business_address' => ['required', 'string', 'max:255'],
            'business_permit' => ['required', 'string', 'max:255'],
            'tin' => ['required', 'string', 'max:255'],
            'type_of_business' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $user->employerInformation()->updateOrCreate(
            ['users_id' => $user->id],
            $validated,
        );

        return redirect('/user-management/employer-account');
    }

    public function destroy(User $user): \Illuminate\Http\JsonResponse
    {
        abort_unless($user->role === 'employer', 404);

        try {
            DB::transaction(function () use ($user) {
                // Delete related employer info first (soft delete), then delete user account.
                $user->employerInformation()->delete();
                $user->delete();
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete employer account.',
            ], 500);
        }

        return response()->json([
            'message' => 'Employer account deleted successfully',
        ]);
    }

    /**
     * Toggle employer account status (approved/pending/declined).
     */
    public function toggleStatus(Request $request, User $user): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,pending,declined,rejected',
        ]);

        // Update user status directly without checking employer_information completeness
        $user->status = $request->status;
        $user->save();

        if ($user->role === 'employer') {
            $level = $request->status === 'approved'
                ? 'success'
                : ($request->status === 'pending' ? 'info' : 'error');

            $user->notify(new SystemNotification(
                title: 'Employer account status updated',
                message: "Your employer account status is now \"{$user->status}\".",
                actionUrl: '/settings/profile',
                level: $level,
                meta: ['status' => $user->status],
            ));
        }

        $statusMessages = [
            'approved' => 'Employer account approved successfully',
            'pending' => 'Employer account set to pending',
            'declined' => 'Employer account declined successfully',
            'rejected' => 'Employer account declined successfully', // Legacy support
        ];

        return response()->json([
            'message' => $statusMessages[$request->status] ?? 'Status updated successfully',
            'status' => $user->status,
        ]);
    }

    /**
     * Update business information status (approve/decline).
     */
    public function updateBusinessStatus(Request $request, User $user): \Illuminate\Http\JsonResponse
    {
        abort_unless($user->role === 'employer', 404);

        $request->validate([
            'status' => 'required|in:approved,declined,pending',
        ]);

        $employerInfo = $user->employerInformation;

        if (!$employerInfo) {
            return response()->json([
                'message' => 'Employer information not found',
            ], 404);
        }

        $employerInfo->status = $request->status;
        $employerInfo->save();

        $level = $request->status === 'approved'
            ? 'success'
            : ($request->status === 'pending' ? 'info' : 'error');

        $user->notify(new SystemNotification(
            title: 'Business documents status updated',
            message: "Your business documents status is now \"{$employerInfo->status}\".",
            actionUrl: '/settings/profile',
            level: $level,
            meta: ['status' => $employerInfo->status],
        ));

        $statusMessages = [
            'approved' => 'Business information approved successfully',
            'declined' => 'Business information declined successfully',
            'pending' => 'Business information set to pending',
        ];

        return response()->json([
            'message' => $statusMessages[$request->status] ?? 'Status updated successfully',
            'status' => $employerInfo->status,
        ]);
    }
}
