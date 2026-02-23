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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('loggable_type'); // Model class name
            $table->unsignedBigInteger('loggable_id'); // Model ID
            $table->string('event'); // created, updated, deleted, restored
            $table->unsignedBigInteger('user_id')->nullable(); // Who performed the action
            $table->json('old_values')->nullable(); // Old values before change
            $table->json('new_values')->nullable(); // New values after change
            $table->json('changed_fields')->nullable(); // Only fields that changed
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('description')->nullable(); // Custom description
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['loggable_type', 'loggable_id']);
            $table->index('user_id');
            $table->index('event');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
