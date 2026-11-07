@php
    $themeColorKey = auth()->user()?->theme_color ?? \App\Models\SiteSetting::get('theme_color', 'emerald');
    $palettes = [
        'emerald' => [
            'light' => 'oklch(0.55 0.17 155)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.65 0.18 155)',
            'dark_fg' => 'oklch(0.12 0.04 155)',
        ],
        'maroon' => [
            'light' => 'oklch(0.45 0.19 18)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.60 0.22 18)',
            'dark_fg' => 'oklch(0.99 0 0)',
        ],
        'blue' => [
            'light' => 'oklch(0.55 0.20 250)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.65 0.20 250)',
            'dark_fg' => 'oklch(0.12 0.04 250)',
        ],
        'indigo' => [
            'light' => 'oklch(0.50 0.22 275)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.65 0.22 275)',
            'dark_fg' => 'oklch(0.12 0.04 275)',
        ],
        'purple' => [
            'light' => 'oklch(0.52 0.23 300)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.68 0.23 300)',
            'dark_fg' => 'oklch(0.12 0.04 300)',
        ],
        'rose' => [
            'light' => 'oklch(0.56 0.23 15)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.68 0.22 15)',
            'dark_fg' => 'oklch(0.12 0.04 15)',
        ],
        'amber' => [
            'light' => 'oklch(0.62 0.18 65)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.74 0.18 65)',
            'dark_fg' => 'oklch(0.12 0.04 65)',
        ],
        'teal' => [
            'light' => 'oklch(0.54 0.15 195)',
            'light_fg' => 'oklch(0.99 0 0)',
            'dark' => 'oklch(0.68 0.16 195)',
            'dark_fg' => 'oklch(0.12 0.04 195)',
        ],
        'slate' => [
            'light' => 'oklch(0.205 0 0)',
            'light_fg' => 'oklch(0.985 0 0)',
            'dark' => 'oklch(0.985 0 0)',
            'dark_fg' => 'oklch(0.205 0 0)',
        ],
    ];
    $activePalette = $palettes[$themeColorKey] ?? $palettes['emerald'];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Dynamic Color Palette from Database --}}
        <style id="app-color-palette">
            :root {
                --primary: {{ $activePalette['light'] }} !important;
                --primary-foreground: {{ $activePalette['light_fg'] }} !important;
                --ring: {{ $activePalette['light'] }} !important;
                --sidebar-primary: {{ $activePalette['light'] }} !important;
                --sidebar-primary-foreground: {{ $activePalette['light_fg'] }} !important;
                --sidebar-ring: {{ $activePalette['light'] }} !important;
                --theme-color-id: "{{ $themeColorKey }}";
            }

            .dark {
                --primary: {{ $activePalette['dark'] }} !important;
                --primary-foreground: {{ $activePalette['dark_fg'] }} !important;
                --ring: {{ $activePalette['dark'] }} !important;
                --sidebar-primary: {{ $activePalette['dark'] }} !important;
                --sidebar-primary-foreground: {{ $activePalette['dark_fg'] }} !important;
                --sidebar-ring: {{ $activePalette['dark'] }} !important;
            }
        </style>

        {{-- Inline script to apply theme before React hydrates (avoids flash / stuck theme) --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark);

                document.documentElement.classList.toggle('dark', isDark);
                document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
