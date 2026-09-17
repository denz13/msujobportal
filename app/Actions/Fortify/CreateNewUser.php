<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'business_name' => ['required', 'string', 'max:255'],
            'business_permit' => ['required', 'file', 'mimes:jpeg,jpg,png,gif,pdf', 'max:10240'],
            'business_address' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:50'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'],
            'password' => $this->passwordRules(),
        ], [
            'business_name.required' => 'The business name field is required.',
            'business_permit.required' => 'Please upload your business permit.',
            'business_address.required' => 'The business address/location is required.',
            'contact_number.required' => 'The contact number field is required.',
        ])->validate();

        $businessName = trim((string) ($input['business_name'] ?? ''));
        $nameParts = preg_split('/\s+/', $businessName, 2);
        $firstname = $nameParts[0] ?? $businessName;
        $lastname = $nameParts[1] ?? '';

        $photoPath = null;
        if (Request::hasFile('photo')) {
            $photoFile = Request::file('photo');
            $photoName = 'photo_' . time() . '_' . uniqid() . '.' . $photoFile->getClientOriginalExtension();
            $photoDir = 'uploads/photos';
            if (!is_dir(public_path($photoDir))) {
                mkdir(public_path($photoDir), 0755, true);
            }
            $photoFile->move(public_path($photoDir), $photoName);
            $photoPath = $photoDir . '/' . $photoName;
        }

        $user = User::create([
            'firstname' => $firstname,
            'middlename' => null,
            'lastname' => $lastname,
            'suffix' => null,
            'address' => $input['business_address'] ?? null,
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => 'employer',
            'photo' => $photoPath,
            'status' => 'approved',
        ]);

        $permitPath = null;
        if (Request::hasFile('business_permit')) {
            $permitFile = Request::file('business_permit');
            $permitName = 'business_permit_' . $user->id . '_' . time() . '.' . $permitFile->getClientOriginalExtension();
            $permitDir = 'uploads/business_permits';
            if (!is_dir(public_path($permitDir))) {
                mkdir(public_path($permitDir), 0755, true);
            }
            $permitFile->move(public_path($permitDir), $permitName);
            $permitPath = $permitDir . '/' . $permitName;
        }

        $user->employerInformation()->create([
            'position' => 'Business Owner / Representative',
            'contact_number' => $input['contact_number'] ?? '',
            'business_address' => $input['business_address'] ?? '',
            'business_permit' => $permitPath,
            'tin' => null,
            'type_of_business' => null,
            'status' => 'pending',
        ]);

        return $user;
    }
}
