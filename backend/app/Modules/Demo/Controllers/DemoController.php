<?php

namespace App\Modules\Demo\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Announcement\Models\Announcement;
use App\Modules\Department\Models\Department;
use App\Modules\Holiday\Models\Holiday;
use App\Modules\Leave\Models\Leave;
use App\Modules\LeaveBalance\Models\UserLeaveBalance;
use App\Modules\LeaveBalance\Services\LeaveBalanceService;
use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\LeaveType\Models\LeaveType;
use App\Modules\Notification\Models\Notification;
use App\Modules\Presence\Models\Presence;
use App\Modules\User\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DemoController extends Controller
{
    public function seed(): JsonResponse
    {
        $admin = User::where('role', 'admin')->first();
        $today = Carbon::today();
        $currentYear = $today->year;
        $lastYear    = $currentYear - 1;

        // ── 1. Departments ─────────────────────────────────────────
        $deptData = [
            ['name' => 'Engineering',      'description' => 'Software development, DevOps and infrastructure'],
            ['name' => 'Human Resources',  'description' => 'Recruitment, culture and employee relations'],
            ['name' => 'Finance',          'description' => 'Budgeting, payroll and financial planning'],
            ['name' => 'Marketing',        'description' => 'Brand, campaigns and growth'],
            ['name' => 'Sales',            'description' => 'Revenue, partnerships and client success'],
            ['name' => 'Design',           'description' => 'UI/UX design, branding and creative'],
            ['name' => 'Operations',       'description' => 'Business operations and process improvement'],
        ];
        $deptMap = [];
        foreach ($deptData as $d) {
            $deptMap[$d['name']] = Department::firstOrCreate(['name' => $d['name']], $d);
        }

        // ── 2. Leave Types (rely on seeder, but ensure they exist) ─
        $leaveTypes = LeaveType::all()->keyBy('slug');

        // ── 3. Leave Group (default should already exist) ──────────
        $defaultGroup = LeaveGroup::where('is_default', true)->first();

        // ── 4. Employees — culturally appropriate names per country ─
        $employees = [
            // India (IN)
            ['name' => 'Arjun Sharma',    'email' => 'arjun@company.com',    'position' => 'Senior Backend Engineer',   'department' => 'Engineering',     'country_code' => 'IN', 'phone' => '+91-98765-43210', 'bio' => 'Full-stack developer with 6 years in Laravel & React.'],
            ['name' => 'Priya Nair',      'email' => 'priya@company.com',    'position' => 'HR Manager',                'department' => 'Human Resources', 'country_code' => 'IN', 'phone' => '+91-98765-43211', 'bio' => 'Passionate about building great company culture.'],
            ['name' => 'Rahul Verma',     'email' => 'rahul@company.com',    'position' => 'DevOps Engineer',            'department' => 'Engineering',     'country_code' => 'IN', 'phone' => '+91-98765-43212', 'bio' => 'Docker, K8s, CI/CD enthusiast.'],
            ['name' => 'Meera Iyer',      'email' => 'meera@company.com',    'position' => 'Finance Analyst',           'department' => 'Finance',         'country_code' => 'IN', 'phone' => '+91-98765-43213', 'bio' => 'CA with expertise in financial modelling.'],
            ['name' => 'Vikram Deshmukh', 'email' => 'vikram@company.com',   'position' => 'UI/UX Designer',            'department' => 'Design',          'country_code' => 'IN', 'phone' => '+91-98765-43214', 'bio' => 'Design thinker and Figma power user.'],

            // United States (US)
            ['name' => 'Emily Carter',    'email' => 'emily@company.com',    'position' => 'Marketing Manager',         'department' => 'Marketing',       'country_code' => 'US', 'phone' => '+1-555-0201',     'bio' => 'Growth marketing lead with B2B SaaS focus.'],
            ['name' => 'James Wilson',    'email' => 'james@company.com',    'position' => 'Sales Director',            'department' => 'Sales',           'country_code' => 'US', 'phone' => '+1-555-0202',     'bio' => '10+ years in enterprise sales & partnerships.'],
            ['name' => 'Sophia Adams',    'email' => 'sophia@company.com',   'position' => 'Frontend Developer',        'department' => 'Engineering',     'country_code' => 'US', 'phone' => '+1-555-0203',     'bio' => 'React & TypeScript specialist.'],

            // United Kingdom (GB)
            ['name' => 'Oliver Hughes',   'email' => 'oliver@company.com',   'position' => 'Product Manager',           'department' => 'Engineering',     'country_code' => 'GB', 'phone' => '+44-7700-900100', 'bio' => 'PM with a passion for user-centered design.'],
            ['name' => 'Charlotte Evans', 'email' => 'charlotte@company.com','position' => 'Content Strategist',        'department' => 'Marketing',       'country_code' => 'GB', 'phone' => '+44-7700-900101', 'bio' => 'Writer & storyteller for tech brands.'],

            // Germany (DE)
            ['name' => 'Lukas Müller',    'email' => 'lukas@company.com',    'position' => 'Data Engineer',             'department' => 'Engineering',     'country_code' => 'DE', 'phone' => '+49-170-1234567', 'bio' => 'Python, Spark and data pipeline architect.'],

            // Singapore (SG)
            ['name' => 'Wei Lin Tan',     'email' => 'weilin@company.com',   'position' => 'Operations Manager',        'department' => 'Operations',      'country_code' => 'SG', 'phone' => '+65-9123-4567',   'bio' => 'Streamlining APAC operations.'],

            // Canada (CA)
            ['name' => 'Ethan Roy',       'email' => 'ethan@company.com',    'position' => 'QA Lead',                   'department' => 'Engineering',     'country_code' => 'CA', 'phone' => '+1-416-555-0301', 'bio' => 'Automation testing evangelist.'],

            // Australia (AU)
            ['name' => 'Mia O\'Brien',    'email' => 'mia@company.com',      'position' => 'Recruiter',                 'department' => 'Human Resources', 'country_code' => 'AU', 'phone' => '+61-412-345-678', 'bio' => 'Talent acquisition across APAC.'],

            // Japan (JP)
            ['name' => 'Yuki Tanaka',     'email' => 'yuki@company.com',     'position' => 'UX Researcher',             'department' => 'Design',          'country_code' => 'JP', 'phone' => '+81-90-1234-5678','bio' => 'User research and accessibility advocate.'],
        ];

        $userMap = [];
        foreach ($employees as $emp) {
            $userMap[$emp['email']] = User::firstOrCreate(
                ['email' => $emp['email']],
                [
                    'name'           => $emp['name'],
                    'password'       => 'ab@123CD',
                    'role'           => 'employee',
                    'position'       => $emp['position'],
                    'department_id'  => $deptMap[$emp['department']]->id,
                    'country_code'   => $emp['country_code'],
                    'leave_group_id' => $defaultGroup?->id,
                    'phone'          => $emp['phone'],
                    'bio'            => $emp['bio'],
                    'is_active'      => true,
                ]
            );
        }

        // ── 5. Provision leave balances for current + last year ─────
        $balanceService = app(LeaveBalanceService::class);
        foreach ($userMap as $user) {
            $balanceService->provisionForUser($user, $currentYear);
            $balanceService->provisionForUser($user, $lastYear);
        }

        // ── 6. Country-specific Holidays ────────────────────────────
        $holidays = [
            // India 2026
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Republic Day',         'date' => "$currentYear-01-26"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Holi',                 'date' => "$currentYear-03-17"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Good Friday',          'date' => "$currentYear-04-03"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Eid ul-Fitr',          'date' => "$currentYear-03-31"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Independence Day',     'date' => "$currentYear-08-15"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Janmashtami',          'date' => "$currentYear-08-25"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Gandhi Jayanti',       'date' => "$currentYear-10-02"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Dussehra',             'date' => "$currentYear-10-19"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Diwali',               'date' => "$currentYear-11-08"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Guru Nanak Jayanti',   'date' => "$currentYear-11-26"],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Christmas',            'date' => "$currentYear-12-25"],
            // US 2026
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'New Year\'s Day',        'date' => "$currentYear-01-01"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Martin Luther King Jr. Day', 'date' => "$currentYear-01-19"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Presidents\' Day',       'date' => "$currentYear-02-16"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Memorial Day',           'date' => "$currentYear-05-25"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Independence Day',       'date' => "$currentYear-07-04"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Labor Day',              'date' => "$currentYear-09-07"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Thanksgiving',           'date' => "$currentYear-11-26"],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Christmas',              'date' => "$currentYear-12-25"],
            // GB 2026
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'New Year\'s Day',       'date' => "$currentYear-01-01"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Good Friday',           'date' => "$currentYear-04-03"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Easter Monday',         'date' => "$currentYear-04-06"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'May Day',               'date' => "$currentYear-05-04"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Spring Bank Holiday',   'date' => "$currentYear-05-25"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Summer Bank Holiday',   'date' => "$currentYear-08-31"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Christmas',             'date' => "$currentYear-12-25"],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Boxing Day',            'date' => "$currentYear-12-26"],
            // Germany 2026
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'New Year\'s Day',              'date' => "$currentYear-01-01"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Good Friday',                  'date' => "$currentYear-04-03"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Easter Monday',                'date' => "$currentYear-04-06"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Labour Day',                   'date' => "$currentYear-05-01"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'German Unity Day',             'date' => "$currentYear-10-03"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Christmas Day',                'date' => "$currentYear-12-25"],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Second Christmas Day',         'date' => "$currentYear-12-26"],
            // Singapore 2026
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'New Year\'s Day',            'date' => "$currentYear-01-01"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Chinese New Year',           'date' => "$currentYear-02-17"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Chinese New Year Day 2',     'date' => "$currentYear-02-18"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Hari Raya Puasa',            'date' => "$currentYear-03-31"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'National Day',               'date' => "$currentYear-08-09"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Deepavali',                  'date' => "$currentYear-11-08"],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Christmas',                  'date' => "$currentYear-12-25"],
            // Canada 2026
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'New Year\'s Day',               'date' => "$currentYear-01-01"],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Good Friday',                   'date' => "$currentYear-04-03"],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Canada Day',                    'date' => "$currentYear-07-01"],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Labour Day',                    'date' => "$currentYear-09-07"],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Thanksgiving',                  'date' => "$currentYear-10-12"],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Christmas',                     'date' => "$currentYear-12-25"],
            // Australia 2026
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'New Year\'s Day',            'date' => "$currentYear-01-01"],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Australia Day',              'date' => "$currentYear-01-26"],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Good Friday',                'date' => "$currentYear-04-03"],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'ANZAC Day',                  'date' => "$currentYear-04-25"],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Queen\'s Birthday',          'date' => "$currentYear-06-08"],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Christmas',                  'date' => "$currentYear-12-25"],
            // Japan 2026
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'New Year\'s Day',                'date' => "$currentYear-01-01"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Coming of Age Day',              'date' => "$currentYear-01-12"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'National Foundation Day',        'date' => "$currentYear-02-11"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Shōwa Day',                      'date' => "$currentYear-04-29"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Constitution Memorial Day',      'date' => "$currentYear-05-03"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Children\'s Day',                'date' => "$currentYear-05-05"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Mountain Day',                   'date' => "$currentYear-08-11"],
            ['country_code' => 'JP', 'country_name' => 'Japan', 'name' => 'Culture Day',                    'date' => "$currentYear-11-03"],
        ];

        foreach ($holidays as $h) {
            Holiday::firstOrCreate(
                ['country_code' => $h['country_code'], 'date' => $h['date']],
                array_merge($h, ['is_active' => true])
            );
        }

        // ── 7. Leave Requests — rich mix of statuses & types ────────
        $annual = $leaveTypes['annual-leave'] ?? null;
        $sick   = $leaveTypes['sick-leave'] ?? null;
        $casual = $leaveTypes['casual-leave'] ?? null;
        $paid   = $leaveTypes['paid-leave'] ?? null;
        $wfh    = $leaveTypes['work-from-home'] ?? null;
        $other  = $leaveTypes['other'] ?? null;

        $leaveRequests = [
            // ── Arjun (IN) — active this year: approved past, pending upcoming, one rejected
            ['email' => 'arjun@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(20), 'end' => $today->copy()->subDays(17), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Family wedding in Jaipur'],
            ['email' => 'arjun@company.com', 'type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(8),  'end' => $today->copy()->subDays(8),  'hours' => 8.0,  'status' => 'approved',  'reason' => 'Fever and cold'],
            ['email' => 'arjun@company.com', 'type_slug' => 'casual-leave',  'start' => $today->copy()->addDays(5),  'end' => $today->copy()->addDays(5),  'hours' => 8.0,  'status' => 'pending',   'reason' => 'Personal errand'],
            ['email' => 'arjun@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->addDays(30), 'end' => $today->copy()->addDays(34), 'hours' => 40.0, 'status' => 'pending',   'reason' => 'Planned trip to Kerala'],

            // ── Priya (IN) — HR, moderate usage
            ['email' => 'priya@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(45), 'end' => $today->copy()->subDays(43), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Visiting parents in Chennai'],
            ['email' => 'priya@company.com', 'type_slug' => 'casual-leave',  'start' => $today->copy()->subDays(10), 'end' => $today->copy()->subDays(10), 'hours' => 8.0,  'status' => 'approved',  'reason' => 'Car service appointment'],
            ['email' => 'priya@company.com', 'type_slug' => 'work-from-home','start' => $today->copy()->addDays(2),  'end' => $today->copy()->addDays(3),  'hours' => 16.0, 'status' => 'approved',  'reason' => 'Plumber visit at home'],

            // ── Rahul (IN) — heavy leave user
            ['email' => 'rahul@company.com', 'type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(30), 'end' => $today->copy()->subDays(28), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Dengue recovery'],
            ['email' => 'rahul@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(5),  'end' => $today->copy()->subDays(3),  'hours' => 24.0, 'status' => 'approved',  'reason' => 'Short vacation to Goa'],
            ['email' => 'rahul@company.com', 'type_slug' => 'casual-leave',  'start' => $today->copy()->addDays(1),  'end' => $today->copy()->addDays(1),  'hours' => 8.0,  'status' => 'pending',   'reason' => 'Bank work'],
            ['email' => 'rahul@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->addDays(15), 'end' => $today->copy()->addDays(19), 'hours' => 40.0, 'status' => 'rejected',  'reason' => 'Team availability conflict'],

            // ── Meera (IN) — minimal usage
            ['email' => 'meera@company.com', 'type_slug' => 'casual-leave',  'start' => $today->copy()->subDays(15), 'end' => $today->copy()->subDays(15), 'hours' => 8.0,  'status' => 'approved',  'reason' => 'Doctor appointment'],

            // ── Vikram (IN) — designer
            ['email' => 'vikram@company.com','type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(60), 'end' => $today->copy()->subDays(56), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Design conference in Bangalore'],
            ['email' => 'vikram@company.com','type_slug' => 'work-from-home','start' => $today->copy()->addDays(3),  'end' => $today->copy()->addDays(4),  'hours' => 16.0, 'status' => 'pending',   'reason' => 'Remote collaboration with client'],

            // ── Emily (US) — marketing
            ['email' => 'emily@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(35), 'end' => $today->copy()->subDays(31), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Spring break road trip'],
            ['email' => 'emily@company.com', 'type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(3),  'end' => $today->copy()->subDays(3),  'hours' => 8.0,  'status' => 'approved',  'reason' => 'Migraine'],
            ['email' => 'emily@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->addDays(20), 'end' => $today->copy()->addDays(22), 'hours' => 24.0, 'status' => 'pending',   'reason' => 'Beach vacation in Florida'],

            // ── James (US) — sales director, less leave
            ['email' => 'james@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(50), 'end' => $today->copy()->subDays(48), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Family reunion'],
            ['email' => 'james@company.com', 'type_slug' => 'paid-leave',    'start' => $today->copy()->addDays(40), 'end' => $today->copy()->addDays(44), 'hours' => 40.0, 'status' => 'pending',   'reason' => 'Summer holiday with kids'],

            // ── Sophia (US) — frontend dev
            ['email' => 'sophia@company.com','type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(12), 'end' => $today->copy()->subDays(11), 'hours' => 16.0, 'status' => 'approved',  'reason' => 'Flu and sore throat'],
            ['email' => 'sophia@company.com','type_slug' => 'casual-leave',  'start' => $today->copy()->addDays(7),  'end' => $today->copy()->addDays(7),  'hours' => 8.0,  'status' => 'pending',   'reason' => 'Apartment move-in'],

            // ── Oliver (GB)
            ['email' => 'oliver@company.com','type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(25), 'end' => $today->copy()->subDays(21), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Holiday in Scotland'],
            ['email' => 'oliver@company.com','type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(2),  'end' => $today->copy()->subDays(2),  'hours' => 8.0,  'status' => 'approved',  'reason' => 'Back pain'],

            // ── Charlotte (GB)
            ['email' => 'charlotte@company.com','type_slug' => 'annual-leave','start' => $today->copy()->addDays(10),'end' => $today->copy()->addDays(14), 'hours' => 40.0, 'status' => 'pending',   'reason' => 'Travel to Lake District'],

            // ── Lukas (DE) — data engineer
            ['email' => 'lukas@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(40), 'end' => $today->copy()->subDays(36), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Skiing trip in Bavaria'],
            ['email' => 'lukas@company.com', 'type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(5),  'end' => $today->copy()->subDays(4),  'hours' => 16.0, 'status' => 'approved',  'reason' => 'Dental surgery recovery'],
            ['email' => 'lukas@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->addDays(25), 'end' => $today->copy()->addDays(29), 'hours' => 40.0, 'status' => 'pending',   'reason' => 'Summer trip to Italy'],

            // ── Wei Lin (SG)
            ['email' => 'weilin@company.com','type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(18), 'end' => $today->copy()->subDays(16), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Chinese New Year family visit'],
            ['email' => 'weilin@company.com','type_slug' => 'casual-leave',  'start' => $today->copy()->addDays(6),  'end' => $today->copy()->addDays(6),  'hours' => 8.0,  'status' => 'pending',   'reason' => 'Passport renewal'],

            // ── Ethan (CA)
            ['email' => 'ethan@company.com', 'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(55), 'end' => $today->copy()->subDays(51), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Skiing in Whistler'],
            ['email' => 'ethan@company.com', 'type_slug' => 'sick-leave',    'start' => $today->copy()->subDays(7),  'end' => $today->copy()->subDays(7),  'hours' => 8.0,  'status' => 'approved',  'reason' => 'Food poisoning'],

            // ── Mia (AU)
            ['email' => 'mia@company.com',   'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(30), 'end' => $today->copy()->subDays(26), 'hours' => 40.0, 'status' => 'approved',  'reason' => 'Road trip on Great Ocean Road'],
            ['email' => 'mia@company.com',   'type_slug' => 'casual-leave',  'start' => $today->copy()->addDays(8),  'end' => $today->copy()->addDays(9),  'hours' => 16.0, 'status' => 'pending',   'reason' => 'Friend\'s wedding'],

            // ── Yuki (JP)
            ['email' => 'yuki@company.com',  'type_slug' => 'annual-leave',  'start' => $today->copy()->subDays(22), 'end' => $today->copy()->subDays(20), 'hours' => 24.0, 'status' => 'approved',  'reason' => 'Golden Week extended trip'],
            ['email' => 'yuki@company.com',  'type_slug' => 'work-from-home','start' => $today->copy()->addDays(4),  'end' => $today->copy()->addDays(5),  'hours' => 16.0, 'status' => 'approved',  'reason' => 'Remote research sessions'],
        ];

        foreach ($leaveRequests as $lr) {
            $user = $userMap[$lr['email']] ?? null;
            $lt   = $leaveTypes[$lr['type_slug']] ?? null;
            if (!$user || !$lt) continue;

            $exists = Leave::where('user_id', $user->id)
                ->where('start_date', $lr['start']->toDateString())
                ->where('leave_type_id', $lt->id)
                ->exists();
            if ($exists) continue;

            Leave::create([
                'user_id'         => $user->id,
                'leave_type_id'   => $lt->id,
                'type'            => str_replace('-', '_', $lr['type_slug']),
                'start_date'      => $lr['start'],
                'end_date'        => $lr['end'],
                'effective_hours' => $lr['hours'],
                'status'          => $lr['status'],
                'reason'          => $lr['reason'],
                'approved_by'     => $lr['status'] !== 'pending' ? ($admin?->id) : null,
            ]);
        }

        // ── 8. Update leave balances "used" for approved leaves ──────
        foreach ($userMap as $user) {
            $approvedLeaves = Leave::where('user_id', $user->id)
                ->where('status', 'approved')
                ->whereYear('start_date', $currentYear)
                ->get();

            foreach ($approvedLeaves as $leave) {
                $balance = UserLeaveBalance::where('user_id', $user->id)
                    ->where('leave_type_id', $leave->leave_type_id)
                    ->where('year', $currentYear)
                    ->first();
                if ($balance) {
                    $balance->update(['used' => $balance->used + $leave->effective_hours]);
                }
            }
        }

        // ── 9. Last year data — simulate usage for a few employees ──
        $lastYearUsage = [
            'arjun@company.com'  => ['annual-leave' => 80.0, 'sick-leave' => 24.0, 'casual-leave' => 32.0],
            'priya@company.com'  => ['annual-leave' => 64.0, 'sick-leave' => 8.0],
            'emily@company.com'  => ['annual-leave' => 96.0, 'casual-leave' => 16.0],
            'oliver@company.com' => ['annual-leave' => 72.0, 'sick-leave' => 16.0, 'paid-leave' => 40.0],
            'lukas@company.com'  => ['annual-leave' => 88.0, 'sick-leave' => 32.0],
            'ethan@company.com'  => ['annual-leave' => 56.0],
            'mia@company.com'    => ['annual-leave' => 48.0, 'casual-leave' => 24.0],
        ];

        foreach ($lastYearUsage as $email => $typeUsage) {
            $user = $userMap[$email] ?? null;
            if (!$user) continue;
            foreach ($typeUsage as $slug => $hours) {
                $lt = $leaveTypes[$slug] ?? null;
                if (!$lt) continue;
                UserLeaveBalance::where('user_id', $user->id)
                    ->where('leave_type_id', $lt->id)
                    ->where('year', $lastYear)
                    ->update(['used' => $hours]);
            }
        }

        // ── 10. Presence statuses ──────────────────────────────────
        $statuses = ['online', 'online', 'online', 'away', 'offline', 'out_of_office'];
        $i = 0;
        foreach ($userMap as $user) {
            Presence::updateOrCreate(
                ['user_id' => $user->id],
                ['status' => $statuses[$i % count($statuses)], 'last_seen' => now()->subMinutes(rand(0, 120))]
            );
            $i++;
        }

        // ── 11. Announcements ──────────────────────────────────────
        $announcements = [
            ['title' => 'Welcome to the Company Portal',      'content' => 'We are excited to launch our new employee management system. Please explore all features and reach out to HR for any questions.'],
            ['title' => 'Q2 All-Hands Meeting',                'content' => 'Join us this Friday at 3 PM in the main conference room for our quarterly review. Remote employees can join via the video link shared via email.'],
            ['title' => 'Updated Leave Policy — Hours Based',  'content' => 'All leave balances are now tracked in hours (1 day = 8 hours). Your balances have been automatically converted. Please check your profile for the updated numbers.'],
            ['title' => 'Public Holiday Calendar Published',   'content' => 'Country-specific public holiday calendars for ' . $currentYear . ' have been published. Check the Holidays section for your country\'s holidays.'],
            ['title' => 'Annual Performance Review Cycle',     'content' => 'The annual performance review cycle begins next month. Please complete your self-assessment by the 15th. Managers will schedule 1-on-1 review meetings.'],
        ];
        foreach ($announcements as $ann) {
            Announcement::firstOrCreate(
                ['title' => $ann['title']],
                ['content' => $ann['content'], 'author_id' => $admin?->id]
            );
        }

        // ── 12. Notifications ──────────────────────────────────────
        $notifTemplates = [
            ['type' => 'leave_approved',  'title' => 'Leave Approved',           'body' => 'Your annual leave request has been approved.'],
            ['type' => 'leave_pending',   'title' => 'Leave Request Submitted',  'body' => 'Your leave request is pending manager approval.'],
            ['type' => 'announcement',    'title' => 'New Announcement',         'body' => 'A new announcement has been posted — check it out!'],
            ['type' => 'holiday_reminder','title' => 'Upcoming Holiday',         'body' => 'A public holiday is coming up this week. Enjoy!'],
        ];
        $ni = 0;
        foreach (array_slice(array_values($userMap), 0, 8) as $user) {
            $tmpl = $notifTemplates[$ni % count($notifTemplates)];
            Notification::firstOrCreate(
                ['user_id' => $user->id, 'type' => $tmpl['type']],
                ['title' => $tmpl['title'], 'body' => $tmpl['body']]
            );
            $ni++;
        }

        return response()->json(['message' => 'Sample data seeded successfully — 15 employees, leaves, balances, holidays & more.']);
    }

    public function reset(): JsonResponse
    {
        $adminIds = User::where('role', 'admin')->pluck('id');
        $nonAdminIds = User::whereNotIn('id', $adminIds)->pluck('id');

        // Delete all non-admin related data (order matters for FK constraints)
        Notification::whereIn('user_id', $nonAdminIds)->delete();
        Presence::whereIn('user_id', $nonAdminIds)->delete();
        UserLeaveBalance::whereIn('user_id', $nonAdminIds)->delete();
        Leave::whereIn('user_id', $nonAdminIds)->delete();
        User::whereNotIn('id', $adminIds)->delete();

        // Clear all announcements, departments, holidays
        Announcement::query()->delete();
        Department::query()->delete();
        Holiday::query()->delete();
        Notification::query()->delete();

        return response()->json(['message' => 'All data cleared. Admin account and system settings preserved.']);
    }
}
