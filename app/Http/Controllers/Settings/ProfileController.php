<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->loadMissing('employerInformation');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'employerInformation' => $user->employerInformation,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = 'photo_' . $user->id . '_' . time() . '.' . $photo->getClientOriginalExtension();
            $photoPath = 'uploads/photos';
            
            // Ensure directory exists
            if (!is_dir(public_path($photoPath))) {
                mkdir(public_path($photoPath), 0755, true);
            }
            
            // Delete old photo if exists
            if ($user->photo && file_exists(public_path($user->photo))) {
                unlink(public_path($user->photo));
            }
            
            // Move file to public/uploads/photos
            $photo->move(public_path($photoPath), $photoName);
            $validated['photo'] = $photoPath . '/' . $photoName;
        }

        // Auto-calculate age from date_of_birth
        if (isset($validated['date_of_birth']) && $validated['date_of_birth']) {
            $birthDate = new \DateTime($validated['date_of_birth']);
            $today = new \DateTime();
            $age = $today->diff($birthDate)->y;
            $validated['age'] = $age;
        }

        // Update basic user fields
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Update employer information when present
        $businessInfoSubmitted = false;
        if ($user->role === 'employer') {
            $employerData = $request->only([
                'position',
                'contact_number',
                'business_address',
                'tin',
                'type_of_business',
            ]);

            // Handle business_permit file upload
            if ($request->hasFile('business_permit')) {
                $businessPermit = $request->file('business_permit');
                $permitName = 'business_permit_' . $user->id . '_' . time() . '.' . $businessPermit->getClientOriginalExtension();
                $permitPath = 'uploads/business_permits';
                
                // Ensure directory exists
                if (!is_dir(public_path($permitPath))) {
                    mkdir(public_path($permitPath), 0755, true);
                }
                
                // Delete old permit if exists
                $existingPermit = $user->employerInformation?->business_permit;
                if ($existingPermit && file_exists(public_path($existingPermit))) {
                    unlink(public_path($existingPermit));
                }
                
                // Move file to public/uploads/business_permits
                $businessPermit->move(public_path($permitPath), $permitName);
                $employerData['business_permit'] = $permitPath . '/' . $permitName;
            }

            // Check if any business information fields are being submitted
            // (even if some are empty, we still want to update status if at least one field has data)
            $hasBusinessData = !empty(array_filter($employerData, static fn ($value) => !is_null($value) && $value !== ''))
                || $request->hasFile('business_permit');

            if ($hasBusinessData) {
                // Remove empty strings so we don't overwrite with blanks unintentionally
                $employerData = array_filter(
                    $employerData,
                    static fn ($value) => !is_null($value) && $value !== ''
                );

                // When submitting/updating business information, always set status to 'pending'
                // This applies to new submissions, updates, and resubmissions after decline
                $employerData['status'] = 'pending';
                
                $user->employerInformation()->updateOrCreate(
                    ['users_id' => $user->id],
                    $employerData,
                );

                // Reload the relation to get updated data
                $user->load('employerInformation');
                
                $businessInfoSubmitted = true;
            }
        }

        // Return with appropriate message
        if ($businessInfoSubmitted) {
            return redirect()
                ->route('profile.edit')
                ->with('toast', [
                    'type' => 'success',
                    'message' => 'Business information submitted successfully. Your information is now pending admin approval.',
                ]);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
