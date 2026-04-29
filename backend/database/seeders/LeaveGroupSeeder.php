<?php

namespace Database\Seeders;

use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\LeaveType\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveGroupSeeder extends Seeder
{
    public function run(): void
    {
        $group = LeaveGroup::firstOrCreate(
            ['name' => 'Default'],
            [
                'description' => 'Standard leave group with default balances for all employees',
                'is_default'  => true,
            ]
        );

        $allocations = [
            'annual'       => 120,
            'paid'         => 80,
            'public-holiday' => 0,
            'maternity'    => 720,
            'paternity'    => 120,
            'sick'         => 96,
            'election-day' => 8,
            'casual'       => 56,
            'wfh'          => 0,
            'other'        => 40,
        ];

        foreach ($allocations as $slug => $balance) {
            $leaveType = LeaveType::where('slug', $slug)->first();
            if ($leaveType) {
                $group->items()->updateOrCreate(
                    ['leave_type_id' => $leaveType->id],
                    ['balance' => $balance]
                );
            }
        }
    }
}
