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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('post_jobs_id')->constrained('post_jobs')->cascadeOnDelete();
            $table->string('resume_path');
            $table->text('description')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamps();

            $table->index(['users_id', 'post_jobs_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};

