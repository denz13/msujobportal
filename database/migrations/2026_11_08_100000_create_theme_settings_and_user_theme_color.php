<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add theme_color to users table if not exists
        if (!Schema::hasColumn('users', 'theme_color')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('theme_color')->default('emerald')->after('status');
            });
        }

        // 2. Create site_settings table if not exists
        if (!Schema::hasTable('site_settings')) {
            Schema::create('site_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->timestamps();
            });

            DB::table('site_settings')->insert([
                'key' => 'theme_color',
                'value' => 'emerald',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'theme_color')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('theme_color');
            });
        }

        Schema::dropIfExists('site_settings');
    }
};

