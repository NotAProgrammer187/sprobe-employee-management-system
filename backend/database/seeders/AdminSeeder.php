<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        if (!User::where('email', 'admin@admin.com')->exists()) {
            User::create([
                'name' => 'System Administrator',
                'email' => 'admin@admin.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Admin user created: admin@admin.com / admin123');
        } else {
            $this->command->info('Admin user already exists');
        }

        // Create sample manager if it doesn't exist
        if (!User::where('email', 'manager@company.com')->exists()) {
            User::create([
                'name' => 'John Manager',
                'email' => 'manager@company.com',
                'password' => Hash::make('manager123'),
                'role' => 'manager',
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Manager user created: manager@company.com / manager123');
        } else {
            $this->command->info('Manager user already exists');
        }

        // Create sample employee if it doesn't exist
        if (!User::where('email', 'employee@company.com')->exists()) {
            User::create([
                'name' => 'Jane Employee',
                'email' => 'employee@company.com',
                'password' => Hash::make('employee123'),
                'role' => 'employee',
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Employee user created: employee@company.com / employee123');
        } else {
            $this->command->info('Employee user already exists');
        }
    }
}