<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\JobseekerOtpMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class JobseekerOtpController extends Controller
{
    /**
     * Send or resend a 6-digit OTP to the user's Gmail address.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'No account found with this email address.',
            ], 404);
        }

        // Generate 6-digit numeric OTP
        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $otp,
                'created_at' => now(),
            ]
        );

        $userName = trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')) ?: 'Job Seeker';

        try {
            Mail::to($user->email)->send(new JobseekerOtpMail(
                userName: $userName,
                otpCode: $otp
            ));
        } catch (\Exception $e) {
            Log::error('Jobseeker OTP email sending failed: ' . $e->getMessage(), [
                'email' => $user->email,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit verification code (OTP) has been sent to ' . $user->email . '.',
            'email' => $user->email,
        ]);
    }

    /**
     * Verify the entered 6-digit OTP and activate email verification.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (! $record) {
            return response()->json([
                'message' => 'No active OTP request found for this email. Please request a new code.',
            ], 422);
        }

        // Check if expired (valid for 10 minutes)
        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'The verification code has expired. Please tap Resend Code to receive a new one.',
            ], 422);
        }

        // Verify OTP digits
        if (trim((string) $record->token) !== trim((string) $validated['otp'])) {
            return response()->json([
                'message' => 'Invalid verification code. Please check your Gmail and try again.',
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if (! $user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Set email verified timestamp
        $user->email_verified_at = now();
        $user->save();

        // Remove token from password_reset_tokens
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gmail address verified successfully!',
            'user' => $user->only(['id', 'firstname', 'middlename', 'lastname', 'email', 'role', 'status']),
        ]);
    }

    /**
     * Send password reset OTP to user's Gmail.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'No account was found with that Gmail address.',
            ], 404);
        }

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only job seeker accounts can be retrieved through this portal.',
            ], 403);
        }

        // Generate 6-digit numeric OTP
        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $otp,
                'created_at' => now(),
            ]
        );

        $userName = trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')) ?: 'Job Seeker';

        try {
            Mail::to($user->email)->send(new \App\Mail\JobseekerPasswordResetMail(
                userName: $userName,
                otpCode: $otp
            ));
        } catch (\Exception $e) {
            Log::error('Password reset email sending failed: ' . $e->getMessage(), [
                'email' => $user->email,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit recovery code (OTP) has been sent to ' . $user->email . '.',
            'email' => $user->email,
        ]);
    }

    /**
     * Verify OTP and reset password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (! $record) {
            return response()->json([
                'message' => 'No active password reset request found. Please request a new recovery code.',
            ], 422);
        }

        // Check expiration (10 minutes)
        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'The recovery code has expired. Please request a new code.',
            ], 422);
        }

        // Verify OTP code
        if (trim((string) $record->token) !== trim((string) $validated['otp'])) {
            return response()->json([
                'message' => 'Incorrect verification code. Please check your Gmail and try again.',
            ], 422);
        }

        $user = User::where('email', $validated['email'])->first();
        if (! $user) {
            return response()->json([
                'message' => 'User account not found.',
            ], 404);
        }

        // Update password and ensure verified
        $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        if (is_null($user->email_verified_at)) {
            $user->email_verified_at = now();
        }
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful! You are now signed in.',
            'user' => $user->only(['id', 'firstname', 'middlename', 'lastname', 'email', 'role', 'status']),
        ]);
    }
}

