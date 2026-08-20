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
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            
            // Recipient relationship & fallback email
            $table->unsignedBigInteger('user_id')->nullable(); // Recipient User ID (from users table)
            $table->string('recipient_email'); // Email to which it was sent
            $table->string('recipient_name')->nullable();
            
            // Sender / Performer
            $table->unsignedBigInteger('sender_id')->nullable(); // Who triggered / sent the email (Auth::id())
            
            // Polymorphic relation (e.g. job_applications, post_jobs, etc.)
            $table->nullableMorphs('emailable'); // emailable_type, emailable_id
            
            // Email metadata & details
            $table->string('mail_type')->nullable(); // e.g. application_approved, application_declined, general
            $table->string('subject');
            $table->text('body')->nullable();
            $table->string('status')->default('sent'); // sent, failed, pending
            $table->text('error_message')->nullable();
            $table->json('meta')->nullable(); // Any extra payload/context
            
            $table->timestamps();

            // Foreign keys & indices
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('sender_id')->references('id')->on('users')->nullOnDelete();
            $table->index('recipient_email');
            $table->index('mail_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
