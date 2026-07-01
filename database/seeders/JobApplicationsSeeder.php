<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\post_jobs;
use App\Models\job_applications;
use Illuminate\Database\Seeder;

class JobApplicationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jobSeekers = User::where('role', 'jobseeker')->get();
        $jobs = post_jobs::all();

        if ($jobSeekers->isEmpty() || $jobs->isEmpty()) {
            return;
        }

        foreach ($jobSeekers as $seeker) {
            // Apply to 1-3 random jobs if they haven't applied to anything yet
            $existingApplications = job_applications::where('users_id', $seeker->id)->count();
            if ($existingApplications > 0) {
                continue;
            }

            $appliedJobs = $jobs->random(rand(1, min(3, $jobs->count())));
            foreach ($appliedJobs as $job) {
                job_applications::create([
                    'users_id' => $seeker->id,
                    'post_jobs_id' => $job->id,
                    'resume_path' => 'resumes/sample.pdf',
                    'description' => fake()->paragraph(),
                    'remarks' => fake()->sentence(),
                    'status' => fake()->randomElement(['submitted', 'under_review', 'accepted', 'rejected']),
                ]);
            }
        }
    }
}
