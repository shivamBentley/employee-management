<?php

namespace Database\Seeders;

use App\Modules\LeaveType\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual Leave',     'slug' => 'annual',          'description' => 'Yearly vacation leave',                        'default_balance' => 120, 'is_paid' => true],
            ['name' => 'Paid Leave',        'slug' => 'paid',            'description' => 'General paid time off',                       'default_balance' => 80,  'is_paid' => true],
            ['name' => 'Public Holiday',    'slug' => 'public-holiday',  'description' => 'Office closed for country-specific holiday',  'default_balance' => 0,   'is_paid' => true],
            ['name' => 'Maternity Leave',   'slug' => 'maternity',       'description' => 'Leave for new mothers',                       'default_balance' => 720, 'is_paid' => true],
            ['name' => 'Paternity Leave',   'slug' => 'paternity',       'description' => 'Leave for new fathers',                       'default_balance' => 120, 'is_paid' => true],
            ['name' => 'Sick Leave',        'slug' => 'sick',            'description' => 'Leave due to illness',                        'default_balance' => 96,  'is_paid' => true],
            ['name' => 'Election Day',      'slug' => 'election-day',    'description' => 'Leave for voting / election duty',            'default_balance' => 8,   'is_paid' => true],
            ['name' => 'Casual Leave',      'slug' => 'casual',          'description' => 'Short-notice personal leave',                 'default_balance' => 56,  'is_paid' => true],
            ['name' => 'Work From Home',    'slug' => 'wfh',             'description' => 'Remote working day',                          'default_balance' => 0,   'is_paid' => true],
            ['name' => 'Other',             'slug' => 'other',           'description' => 'Miscellaneous leave',                         'default_balance' => 40,  'is_paid' => false],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(['slug' => $type['slug']], $type);
        }
    }
}
