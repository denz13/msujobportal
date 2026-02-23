<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmployerProfileIsComplete
{
    /**
     * Ensure employer users have completed their employer profile
     * before accessing the rest of the application.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only apply to authenticated employer users
        if (! $user || $user->role !== 'employer') {
            return $next($request);
        }

        // Allow access to profile settings and logout even when incomplete
        $routeName = $request->route()?->getName();
        $allowedRouteNames = [
            'profile.edit',
            'profile.update',
            'profile.destroy',
            'logout',
        ];

        if (
            in_array($routeName, $allowedRouteNames, true) ||
            str_starts_with($request->path(), 'settings/profile')
        ) {
            return $next($request);
        }

        // Load employer information and check completeness and status
        $user->loadMissing('employerInformation');
        $employerInfo = $user->employerInformation;

        // Check if employer information is complete AND approved
        if ($employerInfo && $employerInfo->isComplete() && $employerInfo->status === 'approved') {
            return $next($request);
        }

        // Redirect if incomplete, pending, or declined
        $message = 'Please complete your employer profile before accessing other pages.';
        if ($employerInfo) {
            if ($employerInfo->status === 'pending') {
                $message = 'Your business information is pending approval. Please wait for admin approval before accessing other pages.';
            } elseif ($employerInfo->status === 'declined') {
                $message = 'Your business information was declined. Please update your information and resubmit for approval.';
            }
        }

        return redirect()
            ->route('profile.edit')
            ->with('toast', [
                'type' => 'warning',
                'message' => $message,
            ]);
    }
}

