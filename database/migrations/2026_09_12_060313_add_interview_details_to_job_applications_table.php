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
        Schema::table('job_applications', function (Blueprint $table) {
            $table->date('interview_date')->nullable()->after('status');
            $table->string('interview_time')->nullable()->after('interview_date');
            $table->string('interview_type')->nullable()->after('interview_time'); // face-to-face, virtual, phone
            $table->text('interview_location')->nullable()->after('interview_type');
            $table->string('contact_person')->nullable()->after('interview_location');
            $table->string('contact_phone')->nullable()->after('contact_person');
            $table->text('interview_instructions')->nullable()->after('contact_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn([
                'interview_date',
                'interview_time',
                'interview_type',
                'interview_location',
                'contact_person',
                'contact_phone',
                'interview_instructions',
            ]);
        });
    }
};
