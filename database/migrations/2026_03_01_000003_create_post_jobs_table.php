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
        Schema::create('post_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('job_title');
            $table->text('job_description');
            $table->string('job_category');
            $table->text('required_qualifications');
            $table->string('location');
            $table->string('salary');
            $table->integer('number_of_vacancies')->default(1);
            $table->string('photo')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_jobs');
    }
};
