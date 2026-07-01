<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\employer_information;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployerInformationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if we already have employers, if not create some
        $employersCount = User::where('role', 'employer')->count();
        $needed = max(0, 5 - $employersCount);

        for ($i = 0; $i < $needed; $i++) {
            User::create([
                'firstname' => fake()->firstName(),
                'lastname' => fake()->lastName(),
                'email' => fake()->unique()->safeEmail(),
                'password' => Hash::make('password'),
                'role' => 'employer',
                'status' => 'approved',
            ]);
        }

        $employers = User::where('role', 'employer')->get();

        foreach ($employers as $employer) {
            employer_information::updateOrCreate(
                ['users_id' => $employer->id],
                [
                    'position' => fake()->jobTitle(),
                    'contact_number' => fake()->phoneNumber(),
                    'business_address' => fake()->address(),
                    'business_permit' => 'permits/sample.pdf',
                    'tin' => fake()->numerify('###-###-###-###'),
                    'type_of_business' => fake()->randomElement(['IT Services', 'Healthcare', 'Finance', 'Education', 'Retail']),
                    'status' => 'approved',
                ]
            );
        }
    }
}
