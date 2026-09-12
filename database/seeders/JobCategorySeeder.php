<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Seeder;

class JobCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Information Technology', 'description' => 'Software engineering, web development, IT support, networking, and data analysis.'],
            ['name' => 'Healthcare & Medical', 'description' => 'Nursing, medical practitioners, pharmacy, allied health, and clinical laboratory.'],
            ['name' => 'Education & Training', 'description' => 'Teaching, academic instruction, educational research, and training management.'],
            ['name' => 'Engineering & Architecture', 'description' => 'Civil, mechanical, electrical, architectural planning, and construction engineering.'],
            ['name' => 'Finance & Accounting', 'description' => 'Auditing, accounting, bookkeeping, financial analysis, and banking services.'],
            ['name' => 'Human Resources & Admin', 'description' => 'Recruitment, office administration, HR management, and organizational development.'],
            ['name' => 'Sales & Marketing', 'description' => 'Digital marketing, sales representation, brand management, and market research.'],
            ['name' => 'Customer Service & BPO', 'description' => 'Technical support, customer care, call center operations, and client relations.'],
            ['name' => 'Hospitality & Tourism', 'description' => 'Hotel and restaurant management, culinary, travel, and tourism services.'],
            ['name' => 'Agriculture & Fishery', 'description' => 'Agri-business, farming, fishery management, and forestry operations.'],
        ];

        foreach ($categories as $cat) {
            JobCategory::firstOrCreate(
                ['name' => $cat['name']],
                [
                    'description' => $cat['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
