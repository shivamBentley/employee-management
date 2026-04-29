<?php

namespace Database\Seeders;

use App\Modules\User\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        if (! User::where('email', 'admin@company.com')->exists()) {
            User::create([
                'name'     => 'System Admin',
                'email'    => 'admin@company.com',
                'password' => 'Admin@123',
                'role'     => 'admin',
                'is_active' => true,
                'position'  => 'System Administrator',
                'phone'     => '+1 800-555-0100',
                'bio'       => 'System administrator managing the EMS platform, user accounts, and company-wide configurations.',
                'country_code'   => 'US',
                'team_name'      => 'IT Operations',
                'date_of_joining' => '2019-01-01',
                'skills'         => ['System Administration', 'Laravel', 'DevOps', 'MySQL', 'Linux'],
                'address'        => '100 Enterprise Blvd',
                'city'           => 'Austin',
                'state'          => 'Texas',
                'zip_code'       => '73301',
            ]);
        }
    }
}
