<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\job_seeker_other_information;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class JobSeekerOtherInformationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if we already have jobseekers, if not create some
        $jobSeekersCount = User::where('role', 'jobseeker')->count();
        $needed = max(0, 10 - $jobSeekersCount);

        for ($i = 0; $i < $needed; $i++) {
            User::create([
                'firstname' => fake()->firstName(),
                'lastname' => fake()->lastName(),
                'email' => fake()->unique()->safeEmail(),
                'password' => Hash::make('password'),
                'role' => 'jobseeker',
                'status' => 'approved',
            ]);
        }

        $jobseekers = User::where('role', 'jobseeker')->get();

        foreach ($jobseekers as $jobseeker) {
            job_seeker_other_information::updateOrCreate(
                ['users_id' => $jobseeker->id],
                [
                    'skills' => implode(', ', fake()->words(5)),
                    'work' => fake()->paragraph(),
                    'status' => 'approved',
                ]
            );
        }
    }
}
