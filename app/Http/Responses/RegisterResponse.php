<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        // Logout the user to prevent auto-login after registration
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Redirect to login page with toast message
        return $request->wantsJson()
            ? new JsonResponse(['message' => 'Registration successful. Please login.'], 201)
            : Redirect::route('login')->with('toast', [
                'type' => 'success',
                'message' => 'Registration successful. Please wait for admin approval before logging in.',
            ]);
    }
}
