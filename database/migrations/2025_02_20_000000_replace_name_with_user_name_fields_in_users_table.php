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
        Schema::table('users', function (Blueprint $table) {
            $table->string('firstname')->default('')->after('id');
            $table->string('middlename')->nullable()->after('firstname');
            $table->string('lastname')->default('')->after('middlename');
            $table->string('suffix')->nullable()->after('lastname');
            $table->string('gender')->nullable()->after('suffix');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->unsignedTinyInteger('age')->nullable()->after('date_of_birth');
            $table->string('address')->nullable()->after('age');
            $table->string('role')->nullable()->after('address');
            $table->string('photo')->nullable()->after('role');
            $table->string('status')->nullable()->after('photo');
        });

        if (Schema::hasColumn('users', 'name')) {
            foreach (DB::table('users')->orderBy('id')->get() as $user) {
                $parts = explode(' ', (string) $user->name, 2);
                DB::table('users')->where('id', $user->id)->update([
                    'firstname' => $parts[0] ?? '',
                    'lastname' => $parts[1] ?? $parts[0] ?? '',
                ]);
            }
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->default('')->after('id');
        });

        foreach (DB::table('users')->orderBy('id')->get() as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'name' => trim($user->firstname . ' ' . $user->lastname),
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'firstname', 'middlename', 'lastname', 'suffix',
                'gender', 'date_of_birth', 'age', 'address',
                'role', 'photo', 'status',
            ]);
        });
    }
};
