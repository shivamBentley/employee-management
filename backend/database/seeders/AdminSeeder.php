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
            ]);
        }
    }
}
