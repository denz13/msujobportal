<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\post_jobs;
use App\Models\save_jobs;
use Illuminate\Database\Seeder;

class SaveJobsSeeder extends Seeder
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
            // Save 1-2 random jobs if they don't have saved jobs yet
            $existingSavedCount = save_jobs::where('users_id', $seeker->id)->count();
            if ($existingSavedCount > 0) {
                continue;
            }

            $savedJobs = $jobs->random(rand(1, min(2, $jobs->count())));
            foreach ($savedJobs as $job) {
                save_jobs::updateOrCreate([
                    'users_id' => $seeker->id,
                    'post_jobs_id' => $job->id,
                ], [
                    'status' => 'saved',
                ]);
            }
        }
    }
}
