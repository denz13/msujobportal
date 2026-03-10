<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class JobseekerLoginController extends Controller
{
    /**
     * Login only for users with role jobseeker and status approved.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only approved job seekers can sign in.',
            ], 403);
        }

        if (strtolower((string) $user->status) !== 'approved') {
            return response()->json([
                'message' => 'Your account is not yet approved. Please wait for approval.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->only(['id', 'firstname', 'middlename', 'lastname', 'email', 'role', 'status']),
        ]);
    }
}
