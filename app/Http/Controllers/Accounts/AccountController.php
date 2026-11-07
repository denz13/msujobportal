<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\BusinessCategory;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Display a paginated listing of user accounts.
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = trim((string) $request->get('search', ''));
        $role = $request->get('role', 'all');
        $status = $request->get('status', 'all');

        $query = User::query()
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
                'gender',
                'address',
                'photo',
                'created_at',
                'updated_at',
            ]);

        // Search filter: firstname, lastname, email, or employer company
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"])
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhereHas('employerInformation', function ($eq) use ($search) {
                        $eq->where('type_of_business', 'LIKE', "%{$search}%")
                            ->orWhere('position', 'LIKE', "%{$search}%");
                    });
            });
        }

        // Role filter
        if ($role !== 'all' && in_array($role, ['admin', 'employer', 'jobseeker'])) {
            $query->where('role', $role);
        }

        // Status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $paginator = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        $paginator->getCollection()->transform(function (User $user) {
            $companyName = $user->employerInformation?->type_of_business;
            $position = $user->employerInformation?->position;
            $contactNumber = $user->employerInformation?->contact_number;

            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'middlename' => $user->middlename,
                'lastname' => $user->lastname,
                'suffix' => $user->suffix,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'status' => $user->status ?? 'pending',
                'gender' => $user->gender,
                'address' => $user->address,
                'photo' => $user->photo,
                'company_name' => $companyName,
                'position' => $position,
                'contact_number' => $contactNumber,
                'created_at' => $user->created_at?->format('M d, Y') ?? '—',
                'created_at_iso' => $user->created_at?->format('Y-m-d H:i') ?? null,
            ];
        });

        // Overview Statistics
        $stats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'employers' => User::where('role', 'employer')->count(),
            'jobseekers' => User::where('role', 'jobseeker')->count(),
            'approved' => User::where('status', 'approved')->count(),
            'pending' => User::where('status', 'pending')->count(),
        ];

        // Active business categories for employer registration
        $businessCategories = BusinessCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();

        return Inertia::render('accounts/accounts', [
            'accounts' => $paginator,
            'stats' => $stats,
            'businessCategories' => $businessCategories,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created account with role: employer or admin.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'in:admin,employer'],
            'status' => ['nullable', 'string', 'in:approved,pending,declined,rejected'],
            'gender' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            // Employer specific fields
            'company_name' => ['nullable', 'string', 'max:255'],
            'type_of_business' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'tin' => ['nullable', 'string', 'max:50'],
        ]);

        $status = $validated['status'] ?? 'approved';

        DB::transaction(function () use ($validated, $status) {
            $user = User::create([
                'firstname' => $validated['firstname'],
                'middlename' => $validated['middlename'] ?? null,
                'lastname' => $validated['lastname'],
                'suffix' => $validated['suffix'] ?? null,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => $status,
                'gender' => $validated['gender'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);

            // If creating an Employer, initialize the employer_information record
            if ($validated['role'] === 'employer') {
                $company = trim((string) ($validated['company_name'] ?? ''));
                $typeOfBusiness = trim((string) ($validated['type_of_business'] ?? ''));
                $businessName = $company !== '' ? $company : ($typeOfBusiness !== '' ? $typeOfBusiness : 'General Business');

                $user->employerInformation()->create([
                    'position' => $validated['position'] ?: 'Business Owner / Representative',
                    'contact_number' => $validated['contact_number'] ?: '—',
                    'business_address' => $validated['address'] ?: 'Not specified',
                    'tin' => $validated['tin'] ?: '—',
                    'type_of_business' => $businessName,
                    'status' => $status === 'approved' ? 'approved' : 'pending',
                ]);
            }
        });

        return redirect()->back()->with('success', "Account successfully created with role: {$validated['role']}.");
    }

    /**
     * Update an existing account.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'in:admin,employer,jobseeker'],
            'status' => ['nullable', 'string', 'in:approved,pending,declined,rejected'],
            'gender' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            // Employer specific fields
            'company_name' => ['nullable', 'string', 'max:255'],
            'type_of_business' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'tin' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($validated, $user) {
            $userData = [
                'firstname' => $validated['firstname'],
                'middlename' => $validated['middlename'] ?? null,
                'lastname' => $validated['lastname'],
                'suffix' => $validated['suffix'] ?? null,
                'email' => $validated['email'],
                'role' => $validated['role'],
                'status' => $validated['status'] ?? $user->status,
                'gender' => $validated['gender'] ?? null,
                'address' => $validated['address'] ?? null,
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $user->update($userData);

            if ($validated['role'] === 'employer') {
                $company = trim((string) ($validated['company_name'] ?? ''));
                $typeOfBusiness = trim((string) ($validated['type_of_business'] ?? ''));
                $businessName = $company !== '' ? $company : ($typeOfBusiness !== '' ? $typeOfBusiness : 'General Business');

                $user->employerInformation()->updateOrCreate(
                    ['users_id' => $user->id],
                    [
                        'position' => $validated['position'] ?: 'Business Owner / Representative',
                        'contact_number' => $validated['contact_number'] ?: '—',
                        'business_address' => $validated['address'] ?: 'Not specified',
                        'tin' => $validated['tin'] ?: '—',
                        'type_of_business' => $businessName,
                        'status' => $user->status === 'approved' ? 'approved' : 'pending',
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    /**
     * Toggle or update account status.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,pending,declined,rejected'],
        ]);

        $user->status = $validated['status'];
        $user->save();

        if ($user->role === 'employer' && $user->employerInformation) {
            $user->employerInformation->status = $validated['status'] === 'approved' ? 'approved' : 'pending';
            $user->employerInformation->save();
        }

        // Notify user if applicable
        $level = $validated['status'] === 'approved' ? 'success' : ($validated['status'] === 'pending' ? 'info' : 'error');
        $user->notify(new SystemNotification(
            title: 'Account status updated',
            message: "Your account status has been updated to {$user->status}.",
            actionUrl: '/settings/profile',
            level: $level,
        ));

        return redirect()->back()->with('success', "Account status updated to {$user->status}.");
    }

    /**
     * Delete an account.
     */
    public function destroy(User $user): RedirectResponse
    {
        if (Auth::id() === $user->id) {
            return redirect()->back()->withErrors(['error' => 'You cannot delete your own logged-in account.']);
        }

        DB::transaction(function () use ($user) {
            if ($user->employerInformation) {
                $user->employerInformation()->delete();
            }
            $user->delete();
        });

        return redirect()->back()->with('success', 'Account deleted successfully.');
    }
}
