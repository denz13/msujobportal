<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\job_seeker_other_information;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class JobseekerProfileController extends Controller
{
    /**
     * Return job seeker profile (User + job_seeker_other_information).
     */
    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Profile not found.',
            ], 404);
        }

        $other = job_seeker_other_information::where('users_id', $user->id)->first();

        return response()->json([
            'user' => $user->only([
                'id',
                'firstname',
                'middlename',
                'lastname',
                'suffix',
                'gender',
                'date_of_birth',
                'age',
                'address',
                'email',
                'role',
                'status',
                'photo',
            ]),
            'job_seeker_other_information' => $other
                ? $other->only(['skills', 'work', 'status'])
                : ['skills' => null, 'work' => null, 'status' => null],
        ]);
    }

    /**
     * Update job seeker profile fields.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Profile not found.',
            ], 404);
        }

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'age' => ['nullable', 'integer', 'min:0', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'job_seeker_other_information' => ['nullable', 'array'],
            'job_seeker_other_information.skills' => ['nullable', 'string'],
            'job_seeker_other_information.work' => ['nullable', 'string'],
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
        ];

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');

            $dir = public_path('uploads/profile-photos');
            if (! File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }

            $filename = 'profile-' . $user->id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($dir, $filename);

            // Store relative public path in DB.
            $userData['photo'] = 'uploads/profile-photos/' . $filename;
        }

        $other = $validated['job_seeker_other_information'] ?? [];
        $otherData = [
            'skills' => $other['skills'] ?? null,
            'work' => $other['work'] ?? null,
        ];

        DB::transaction(function () use ($user, $userData, $otherData) {
            $user->update($userData);

            job_seeker_other_information::updateOrCreate(
                ['users_id' => $user->id],
                array_merge($otherData, ['users_id' => $user->id])
            );
        });

        return response()->json([
            'message' => 'Profile updated successfully.',
        ]);
    }
}

