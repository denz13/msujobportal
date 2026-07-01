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
        Schema::create('employer_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('users_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('position');
            $table->string('contact_number');
            $table->text('business_address');
            $table->string('business_permit')->nullable();
            $table->string('tin');
            $table->string('type_of_business');
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
        Schema::dropIfExists('employer_information');
    }
};
