<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get all users
        $users = User::all();
        
        foreach ($users as $user) {
            // Check if employee already exists for this user using raw query to avoid SoftDeletes issue
            $existingEmployee = DB::table('employees')->where('user_id', $user->id)->first();
            
            if (!$existingEmployee) {
                // Create employee from user data using DB::table to avoid model issues
                DB::table('employees')->insert([
                    'user_id' => $user->id,
                    'employee_id' => 'EMP' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'first_name' => $this->extractFirstName($user->name),
                    'last_name' => $this->extractLastName($user->name),
                    'email' => $user->email,
                    'phone' => $this->generatePhoneNumber(),
                    'department' => $this->getDepartmentByRole($user->role),
                    'position' => $this->getPositionByRole($user->role),
                    'manager_name' => $this->getManagerByRole($user->role),
                    'hire_date' => $user->created_at->format('Y-m-d'),
                    'status' => $user->is_active ? 'active' : 'inactive',
                    'salary' => $this->getSalaryByRole($user->role),
                    'address' => $this->generateAddress(),
                    'birth_date' => $this->generateBirthDate(),
                    'gender' => $this->generateGender(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        
        $employeeCount = DB::table('employees')->count();
        $this->command->info("Total employees in database: {$employeeCount}");
    }
    
    private function extractFirstName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? 'Unknown';
    }
    
    private function extractLastName($fullName)
    {
        $parts = explode(' ', trim($fullName));
        if (count($parts) > 1) {
            array_shift($parts); // Remove first name
            return implode(' ', $parts);
        }
        return 'Lastname';
    }
    
    private function generatePhoneNumber()
    {
        return '+1-' . rand(100, 999) . '-' . rand(100, 999) . '-' . rand(1000, 9999);
    }
    
    private function getDepartmentByRole($role)
    {
        $departments = [
            'admin' => 'Administration',
            'manager' => 'Management',
            'employee' => 'Operations',
        ];
        
        return $departments[$role] ?? 'General';
    }
    
    private function getPositionByRole($role)
    {
        $positions = [
            'admin' => 'System Administrator',
            'manager' => 'Department Manager',
            'employee' => 'Staff Member',
        ];
        
        return $positions[$role] ?? 'Employee';
    }
    
    private function getManagerByRole($role)
    {
        if ($role === 'admin') {
            return null; // Admins don't have managers
        } elseif ($role === 'manager') {
            return 'System Administrator'; // Managers report to admin
        } else {
            return 'John Manager'; // Employees report to managers
        }
    }
    
    private function getSalaryByRole($role)
    {
        $salaries = [
            'admin' => rand(80000, 120000),
            'manager' => rand(60000, 90000),
            'employee' => rand(40000, 70000),
        ];
        
        return $salaries[$role] ?? 50000;
    }
    
    private function generateAddress()
    {
        $streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr'];
        $cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
        $states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
        
        $streetNum = rand(100, 9999);
        $street = $streets[array_rand($streets)];
        $city = $cities[array_rand($cities)];
        $state = $states[array_rand($states)];
        $zip = rand(10000, 99999);
        
        return "{$streetNum} {$street}, {$city}, {$state} {$zip}";
    }
    
    private function generateBirthDate()
    {
        // Generate random birth date between 1970 and 2000
        $startDate = strtotime('1970-01-01');
        $endDate = strtotime('2000-12-31');
        $randomTimestamp = rand($startDate, $endDate);
        
        return date('Y-m-d', $randomTimestamp);
    }
    
    private function generateGender()
    {
        $genders = ['male', 'female', 'other'];
        return $genders[array_rand($genders)];
    }
}