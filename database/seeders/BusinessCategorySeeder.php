<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'IT Services & Technology', 'description' => 'Software development, IT support, cloud services, and digital solutions.'],
            ['name' => 'Healthcare & Pharmaceuticals', 'description' => 'Hospitals, clinics, medical supply, diagnostics, and pharmaceutical care.'],
            ['name' => 'Finance, Banking & Insurance', 'description' => 'Banking institutions, investment firms, microfinance, and insurance.'],
            ['name' => 'Education & Academia', 'description' => 'Schools, universities, vocational training, and educational services.'],
            ['name' => 'Retail & Wholesale', 'description' => 'E-commerce, department stores, groceries, and merchandise distribution.'],
            ['name' => 'Construction & Real Estate', 'description' => 'Building construction, property development, leasing, and architectural services.'],
            ['name' => 'Manufacturing & Production', 'description' => 'Industrial manufacturing, food processing, packaging, and goods fabrication.'],
            ['name' => 'Hospitality, Food & Tourism', 'description' => 'Hotels, resorts, restaurants, catering, and travel agencies.'],
            ['name' => 'Agriculture & Fishery', 'description' => 'Crop farming, livestock, fisheries, and agro-industrial business.'],
            ['name' => 'Transportation & Logistics', 'description' => 'Freight forwarding, delivery, warehousing, courier, and fleet services.'],
            ['name' => 'BPO & Call Center Services', 'description' => 'Customer contact centers, back-office operations, and shared services.'],
            ['name' => 'Media, Advertising & Marketing', 'description' => 'Creative agencies, digital marketing, broadcasting, and content production.'],
        ];

        foreach ($categories as $cat) {
            BusinessCategory::firstOrCreate(
                ['name' => $cat['name']],
                [
                    'description' => $cat['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
