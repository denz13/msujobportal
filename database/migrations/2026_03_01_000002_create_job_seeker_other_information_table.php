<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_seeker_other_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('users_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('skills')->nullable();
            $table->text('work')->nullable();
            $table->string('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_seeker_other_information');
    }
};
