<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\job_seeker_other_information;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class JobseekerRegisterController extends Controller
{
    /**
     * Register a new job seeker (User + job_seeker_other_information).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'age' => ['nullable', 'integer', 'min:0', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'confirmed', Password::default()],
            'role' => ['nullable', 'string', 'in:jobseeker'],
            'status' => ['nullable', 'string', 'max:50'],
            'job_seeker_other_information' => ['nullable', 'array'],
            'job_seeker_other_information.skills' => ['nullable', 'string'],
            'job_seeker_other_information.work' => ['nullable', 'string'],
            'job_seeker_other_information.status' => ['nullable', 'string', 'max:50'],
        ]);

        $userData = [
            'firstname' => $validated['firstname'],
            'middlename' => $validated['middlename'] ?? null,
            'lastname' => $validated['lastname'],
            'suffix' => $validated['suffix'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'age' => $validated['age'] ?? null,
            'address' => $validated['address'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'jobseeker',
            'status' => $validated['status'] ?? 'approved',
            'email_verified_at' => null,
        ];

        try {
            DB::transaction(function () use ($userData, $validated) {
                $user = User::create($userData);

                $other = $validated['job_seeker_other_information'] ?? [];
                job_seeker_other_information::create([
                    'users_id' => $user->id,
                    'skills' => $other['skills'] ?? null,
                    'work' => $other['work'] ?? null,
                    'status' => $other['status'] ?? 'approved',
                ]);
            });

            // Generate and send 6-digit OTP to user's Gmail
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $validated['email']],
                [
                    'token' => $otp,
                    'created_at' => now(),
                ]
            );

            $userName = trim($validated['firstname'] . ' ' . $validated['lastname']) ?: 'Job Seeker';
            try {
                \Illuminate\Support\Facades\Mail::to($validated['email'])->send(
                    new \App\Mail\JobseekerOtpMail(userName: $userName, otpCode: $otp)
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Registration OTP email send failed: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            return response()->json(
                ['message' => 'Registration failed. Please try again.'],
                422
            );
        }

        return response()->json([
            'message' => 'Registration successful! A 6-digit verification code (OTP) was sent to your Gmail.',
            'requires_verification' => true,
            'email' => $validated['email'],
        ], 201);
    }
}
