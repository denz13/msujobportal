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

        // Check if email has been verified via OTP
        if (is_null($user->email_verified_at)) {
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => $otp, 'created_at' => now()]
            );

            $userName = trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')) ?: 'Job Seeker';
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(
                    new \App\Mail\JobseekerOtpMail(userName: $userName, otpCode: $otp)
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Login OTP sending failed: ' . $e->getMessage());
            }

            return response()->json([
                'requires_verification' => true,
                'email' => $user->email,
                'message' => 'Please verify your Gmail address. A 6-digit verification code (OTP) was sent to ' . $user->email . '.',
            ], 200);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->only(['id', 'firstname', 'middlename', 'lastname', 'email', 'role', 'status']),
        ]);
    }
}
