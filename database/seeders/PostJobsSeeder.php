<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\post_jobs;
use Illuminate\Database\Seeder;

class PostJobsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employers = User::where('role', 'employer')->get();

        if ($employers->isEmpty()) {
            return;
        }

        foreach ($employers as $employer) {
            // Seed 1-3 jobs for each employer if they don't have jobs yet
            $existingJobsCount = post_jobs::where('user_id', $employer->id)->count();
            if ($existingJobsCount > 0) {
                continue;
            }

            $numJobs = rand(1, 3);
            for ($i = 0; $i < $numJobs; $i++) {
                post_jobs::create([
                    'user_id' => $employer->id,
                    'job_title' => fake()->jobTitle(),
                    'job_description' => fake()->paragraphs(3, true),
                    'job_category' => fake()->randomElement(['Information Technology', 'Human Resources', 'Engineering', 'Marketing', 'Sales']),
                    'required_qualifications' => fake()->paragraphs(2, true),
                    'location' => fake()->city() . ', ' . fake()->state(),
                    'salary' => fake()->randomElement(['$50,000 - $70,000', '$80,000 - $100,000', '$120,000 - $150,000']),
                    'number_of_vacancies' => rand(1, 5),
                    'photo' => null,
                    'remarks' => fake()->sentence(),
                    'status' => fake()->randomElement(['pending', 'approved', 'declined']),
                ]);
            }
        }
    }
}
