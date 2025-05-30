<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            EmployeeSeeder::class,
            ReviewCriteriaSeeder::class, // Your existing basic seeder
            CriteriaTemplateSeeder::class, // New comprehensive criteria seeder
        ]);
    }
}