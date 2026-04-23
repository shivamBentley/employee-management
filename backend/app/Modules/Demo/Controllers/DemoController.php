<?php

namespace App\Modules\Demo\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Announcement\Models\Announcement;
use App\Modules\Department\Models\Department;
use App\Modules\Leave\Models\Leave;
use App\Modules\User\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DemoController extends Controller
{
    public function seed(): JsonResponse
    {
        // Departments
        $departments = [
            ['name' => 'Engineering',      'description' => 'Software development and infrastructure'],
            ['name' => 'Human Resources',  'description' => 'Recruitment, culture and employee relations'],
            ['name' => 'Finance',          'description' => 'Budgeting, payroll and financial planning'],
            ['name' => 'Marketing',        'description' => 'Brand, campaigns and growth'],
            ['name' => 'Sales',            'description' => 'Revenue, partnerships and client success'],
        ];

        $deptMap = [];
        foreach ($departments as $dept) {
            $deptMap[$dept['name']] = Department::firstOrCreate(
                ['name' => $dept['name']],
                ['description' => $dept['description']]
            );
        }

        // Employees
        $employees = [
            ['name' => 'Alice Johnson',  'email' => 'alice@company.com',  'position' => 'Senior Engineer',      'department' => 'Engineering',     'phone' => '+1-555-0101', 'is_active' => true],
            ['name' => 'Bob Martinez',   'email' => 'bob@company.com',    'position' => 'DevOps Engineer',       'department' => 'Engineering',     'phone' => '+1-555-0102', 'is_active' => true],
            ['name' => 'Carol White',    'email' => 'carol@company.com',  'position' => 'HR Manager',            'department' => 'Human Resources', 'phone' => '+1-555-0103', 'is_active' => true],
            ['name' => 'David Kim',      'email' => 'david@company.com',  'position' => 'Recruiter',             'department' => 'Human Resources', 'phone' => '+1-555-0104', 'is_active' => true],
            ['name' => 'Eva Brown',      'email' => 'eva@company.com',    'position' => 'Finance Analyst',       'department' => 'Finance',         'phone' => '+1-555-0105', 'is_active' => true],
            ['name' => 'Frank Lee',      'email' => 'frank@company.com',  'position' => 'Marketing Specialist',  'department' => 'Marketing',       'phone' => '+1-555-0106', 'is_active' => true],
            ['name' => 'Grace Patel',    'email' => 'grace@company.com',  'position' => 'Sales Executive',       'department' => 'Sales',           'phone' => '+1-555-0107', 'is_active' => true],
            ['name' => 'Henry Torres',   'email' => 'henry@company.com',  'position' => 'Frontend Developer',    'department' => 'Engineering',     'phone' => '+1-555-0108', 'is_active' => false],
            ['name' => 'Iris Nguyen',    'email' => 'iris@company.com',   'position' => 'Content Writer',        'department' => 'Marketing',       'phone' => '+1-555-0109', 'is_active' => true],
            ['name' => 'Jack Wilson',    'email' => 'jack@company.com',   'position' => 'Account Manager',       'department' => 'Sales',           'phone' => '+1-555-0110', 'is_active' => true],
        ];

        $userMap = [];
        foreach ($employees as $emp) {
            $userMap[$emp['email']] = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name'          => $emp['name'],
                    'password'      => 'Employee@123',
                    'role'          => 'employee',
                    'position'      => $emp['position'],
                    'department_id' => $deptMap[$emp['department']]->id,
                    'phone'         => $emp['phone'],
                    'is_active'     => $emp['is_active'],
                ]
            );
        }

        // Leaves
        $admin = User::where('role', 'admin')->first();
        $today = Carbon::today();

        $leaves = [
            ['user' => 'alice@company.com',  'type' => 'annual',  'start' => $today->copy()->subDays(2),  'end' => $today->copy()->subDays(1),  'status' => 'approved',  'reason' => 'Family vacation'],
            ['user' => 'bob@company.com',    'type' => 'sick',    'start' => $today->copy(),              'end' => $today->copy(),              'status' => 'approved',  'reason' => 'Doctor appointment'],
            ['user' => 'carol@company.com',  'type' => 'annual',  'start' => $today->copy()->addDays(5),  'end' => $today->copy()->addDays(7),  'status' => 'pending',   'reason' => 'Personal travel'],
            ['user' => 'david@company.com',  'type' => 'sick',    'start' => $today->copy()->subDays(1),  'end' => $today->copy()->subDays(1),  'status' => 'rejected',  'reason' => 'Feeling unwell'],
            ['user' => 'eva@company.com',    'type' => 'annual',  'start' => $today->copy()->addDays(10), 'end' => $today->copy()->addDays(12), 'status' => 'pending',   'reason' => 'Conference trip'],
            ['user' => 'grace@company.com',  'type' => 'annual',  'start' => $today->copy()->addDays(2),  'end' => $today->copy()->addDays(3),  'status' => 'pending',   'reason' => 'Wedding ceremony'],
            ['user' => 'iris@company.com',   'type' => 'sick',    'start' => $today->copy(),              'end' => $today->copy()->addDays(1),  'status' => 'approved',  'reason' => 'Flu recovery'],
        ];

        $demoEmails = array_column($employees, 'email');
        foreach ($leaves as $leave) {
            $user = $userMap[$leave['user']] ?? null;
            if (! $user) {
                continue;
            }
            $exists = Leave::where('user_id', $user->id)
                ->where('start_date', $leave['start']->toDateString())
                ->exists();
            if (! $exists) {
                Leave::create([
                    'user_id'     => $user->id,
                    'type'        => $leave['type'],
                    'start_date'  => $leave['start'],
                    'end_date'    => $leave['end'],
                    'status'      => $leave['status'],
                    'reason'      => $leave['reason'],
                    'approved_by' => $leave['status'] !== 'pending' ? ($admin?->id) : null,
                ]);
            }
        }

        // Announcements
        $announcements = [
            [
                'title'   => 'Welcome to the Company Portal',
                'content' => 'We are excited to launch our new employee management system. Please explore all features and reach out to HR for any questions.',
            ],
            [
                'title'   => 'Q2 All-Hands Meeting',
                'content' => 'Join us this Friday at 3 PM in the main conference room for our quarterly review. Remote employees can join via the video link shared via email.',
            ],
            [
                'title'   => 'Updated Leave Policy',
                'content' => 'Effective next month, annual leave entitlement increases to 20 days per year. Please review the updated policy document in the HR portal.',
            ],
        ];

        foreach ($announcements as $ann) {
            Announcement::firstOrCreate(
                ['title' => $ann['title']],
                ['content' => $ann['content'], 'author_id' => $admin?->id]
            );
        }

        return response()->json(['message' => 'Demo data seeded successfully.']);
    }

    public function reset(): JsonResponse
    {
        $demoEmails = [
            'alice@company.com', 'bob@company.com', 'carol@company.com',
            'david@company.com', 'eva@company.com',  'frank@company.com',
            'grace@company.com', 'henry@company.com', 'iris@company.com',
            'jack@company.com',
        ];

        $demoUserIds = User::whereIn('email', $demoEmails)->pluck('id');

        Leave::whereIn('user_id', $demoUserIds)->delete();

        $demoTitles = [
            'Welcome to the Company Portal',
            'Q2 All-Hands Meeting',
            'Updated Leave Policy',
        ];
        Announcement::whereIn('title', $demoTitles)->delete();

        User::whereIn('email', $demoEmails)->delete();

        $demoDeptNames = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales'];
        Department::whereIn('name', $demoDeptNames)->delete();

        return response()->json(['message' => 'Demo data removed successfully.']);
    }
}
