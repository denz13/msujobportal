<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeColorController extends Controller
{
    /**
     * Update the active color palette in database and cookie.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme_color' => [
                'required',
                'string',
                'in:emerald,maroon,blue,indigo,purple,rose,amber,teal,slate',
            ],
            'apply_global' => ['nullable', 'boolean'],
        ]);

        $color = $validated['theme_color'];
        $user = $request->user();

        // Save to current user's database record
        if ($user) {
            $user->theme_color = $color;
            $user->save();

            // If admin or requested, update global site settings in database
            if ($user->role === 'admin' || !empty($validated['apply_global'])) {
                SiteSetting::set('theme_color', $color);
            }
        } else {
            SiteSetting::set('theme_color', $color);
        }

        return response()->json([
            'success' => true,
            'theme_color' => $color,
            'message' => 'Color palette saved to database successfully.',
        ])->cookie('theme_color', $color, 60 * 24 * 365, '/', null, null, false, false);
    }
}

