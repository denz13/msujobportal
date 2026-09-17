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
        Schema::table('employer_information', function (Blueprint $table) {
            $table->string('position')->nullable()->change();
            $table->string('tin')->nullable()->change();
            $table->string('type_of_business')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employer_information', function (Blueprint $table) {
            $table->string('position')->nullable(false)->change();
            $table->string('tin')->nullable(false)->change();
            $table->string('type_of_business')->nullable(false)->change();
        });
    }
};
