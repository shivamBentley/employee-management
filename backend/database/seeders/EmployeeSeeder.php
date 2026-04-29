<?php

namespace Database\Seeders;

use App\Modules\User\Models\User;
use App\Modules\Department\Models\Department;
use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\LeaveBalance\Services\LeaveBalanceService;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();
        $defaultGroup = LeaveGroup::where('is_default', true)->first();

        if ($departments->isEmpty() || !$defaultGroup) {
            $this->command->warn('Run DepartmentSeeder and LeaveGroupSeeder first.');
            return;
        }

        $employees = [
            [
                'name'      => 'Priya Sharma',
                'email'     => 'priya.sharma@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'Senior Frontend Developer',
                'phone'     => '+91 98765 43210',
                'bio'       => 'Passionate frontend developer with 6+ years of experience building modern web applications. Loves React, design systems, and mentoring junior developers.',
                'country_code'   => 'IN',
                'team_name'      => 'Platform UI',
                'date_of_joining' => '2021-03-15',
                'date_of_birth'  => '1994-07-22',
                'salary'         => 95000,
                'salary_currency' => 'USD',
                'address'        => '42, MG Road, Indiranagar',
                'city'           => 'Bangalore',
                'state'          => 'Karnataka',
                'zip_code'       => '560038',
                'linkedin_url'   => 'https://linkedin.com/in/priya-sharma',
                'skills'         => ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma', 'GraphQL'],
                'education'      => [
                    ['degree' => 'B.Tech in Computer Science', 'institution' => 'IIT Delhi', 'year' => '2016'],
                    ['degree' => 'M.S. in HCI', 'institution' => 'Georgia Tech (Online)', 'year' => '2020'],
                ],
                'experience'     => [
                    ['company' => 'TCS', 'role' => 'Junior Developer', 'from' => '2016', 'to' => '2018', 'description' => 'Built internal tools and dashboards for banking clients.'],
                    ['company' => 'Flipkart', 'role' => 'Frontend Engineer', 'from' => '2018', 'to' => '2021', 'description' => 'Worked on the product listing and checkout flow redesign.'],
                ],
                'emergency_contact_name'  => 'Raj Sharma',
                'emergency_contact_phone' => '+91 98765 00001',
            ],
            [
                'name'      => 'James Wilson',
                'email'     => 'james.wilson@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'Backend Engineer',
                'phone'     => '+1 415-555-0142',
                'bio'       => 'Backend engineer specializing in scalable microservices and cloud infrastructure. AWS certified. Enjoys hiking and open-source contribution.',
                'country_code'   => 'US',
                'team_name'      => 'Core Services',
                'date_of_joining' => '2022-01-10',
                'date_of_birth'  => '1991-11-05',
                'salary'         => 125000,
                'salary_currency' => 'USD',
                'address'        => '1200 Market Street, Apt 4B',
                'city'           => 'San Francisco',
                'state'          => 'California',
                'zip_code'       => '94103',
                'linkedin_url'   => 'https://linkedin.com/in/jameswilson',
                'skills'         => ['PHP', 'Laravel', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
                'education'      => [
                    ['degree' => 'B.S. in Computer Science', 'institution' => 'UC Berkeley', 'year' => '2013'],
                ],
                'experience'     => [
                    ['company' => 'Google', 'role' => 'Software Engineer', 'from' => '2013', 'to' => '2017', 'description' => 'Worked on Google Maps API infrastructure.'],
                    ['company' => 'Stripe', 'role' => 'Senior Engineer', 'from' => '2017', 'to' => '2022', 'description' => 'Built payment processing microservices handling millions of daily transactions.'],
                ],
                'emergency_contact_name'  => 'Sarah Wilson',
                'emergency_contact_phone' => '+1 415-555-0199',
            ],
            [
                'name'      => 'Emily Chen',
                'email'     => 'emily.chen@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'UX Designer',
                'phone'     => '+65 9123 4567',
                'bio'       => 'UX designer focused on creating intuitive experiences. Previously at Shopee. Advocate for accessibility and inclusive design.',
                'country_code'   => 'SG',
                'team_name'      => 'Design',
                'date_of_joining' => '2023-06-01',
                'date_of_birth'  => '1996-02-14',
                'salary'         => 85000,
                'salary_currency' => 'USD',
                'address'        => '10 Bayfront Avenue',
                'city'           => 'Singapore',
                'state'          => 'Central',
                'zip_code'       => '018956',
                'skills'         => ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe XD', 'Accessibility'],
                'education'      => [
                    ['degree' => 'B.Des in Visual Communication', 'institution' => 'NUS', 'year' => '2018'],
                    ['degree' => 'PG Diploma in UX Design', 'institution' => 'Interaction Design Foundation', 'year' => '2019'],
                ],
                'experience'     => [
                    ['company' => 'Shopee', 'role' => 'Product Designer', 'from' => '2018', 'to' => '2023', 'description' => 'Led the redesign of the seller dashboard, improving task completion rate by 35%.'],
                ],
                'emergency_contact_name'  => 'David Chen',
                'emergency_contact_phone' => '+65 9123 0000',
            ],
            [
                'name'      => 'Oliver Schmidt',
                'email'     => 'oliver.schmidt@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'DevOps Lead',
                'phone'     => '+49 170 1234567',
                'bio'       => 'DevOps engineer with a passion for CI/CD pipelines, infrastructure as code, and site reliability. Kubernetes enthusiast.',
                'country_code'   => 'DE',
                'team_name'      => 'Infrastructure',
                'date_of_joining' => '2020-09-01',
                'date_of_birth'  => '1989-08-30',
                'salary'         => 110000,
                'salary_currency' => 'EUR',
                'address'        => 'Friedrichstraße 43',
                'city'           => 'Berlin',
                'state'          => 'Berlin',
                'zip_code'       => '10117',
                'linkedin_url'   => 'https://linkedin.com/in/oliverschmidt',
                'skills'         => ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'CI/CD', 'Prometheus', 'Go'],
                'education'      => [
                    ['degree' => 'B.Sc. Informatik', 'institution' => 'TU Berlin', 'year' => '2011'],
                    ['degree' => 'M.Sc. Distributed Systems', 'institution' => 'TU Munich', 'year' => '2013'],
                ],
                'experience'     => [
                    ['company' => 'SAP', 'role' => 'Systems Engineer', 'from' => '2013', 'to' => '2016', 'description' => 'Managed on-premises infrastructure for enterprise clients.'],
                    ['company' => 'Zalando', 'role' => 'Senior DevOps Engineer', 'from' => '2016', 'to' => '2020', 'description' => 'Built and maintained Kubernetes clusters serving 30M+ daily users.'],
                ],
                'emergency_contact_name'  => 'Anna Schmidt',
                'emergency_contact_phone' => '+49 170 9999999',
            ],
            [
                'name'      => 'Aisha Patel',
                'email'     => 'aisha.patel@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'QA Engineer',
                'phone'     => '+91 87654 32100',
                'bio'       => 'Quality assurance engineer ensuring every release meets the highest standards. Expert in test automation and performance testing.',
                'country_code'   => 'IN',
                'team_name'      => 'Quality',
                'date_of_joining' => '2022-07-15',
                'date_of_birth'  => '1995-12-10',
                'salary'         => 72000,
                'salary_currency' => 'USD',
                'address'        => '15, Baner Road',
                'city'           => 'Pune',
                'state'          => 'Maharashtra',
                'zip_code'       => '411045',
                'skills'         => ['Selenium', 'Cypress', 'Jest', 'Playwright', 'JMeter', 'API Testing'],
                'education'      => [
                    ['degree' => 'B.E. in IT', 'institution' => 'Pune University', 'year' => '2017'],
                ],
                'experience'     => [
                    ['company' => 'Infosys', 'role' => 'Test Analyst', 'from' => '2017', 'to' => '2020', 'description' => 'Automated regression test suites for banking applications.'],
                    ['company' => 'ThoughtWorks', 'role' => 'QA Engineer', 'from' => '2020', 'to' => '2022', 'description' => 'Implemented CI/CD integrated testing pipelines for e-commerce platform.'],
                ],
                'emergency_contact_name'  => 'Rahul Patel',
                'emergency_contact_phone' => '+91 87654 00000',
            ],
            [
                'name'      => 'Marcus Johnson',
                'email'     => 'marcus.johnson@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'Product Manager',
                'phone'     => '+1 212-555-0198',
                'bio'       => 'Product manager bridging the gap between business and engineering. Data-driven decision maker with an MBA background.',
                'country_code'   => 'US',
                'team_name'      => 'Product',
                'date_of_joining' => '2021-11-01',
                'date_of_birth'  => '1990-04-18',
                'salary'         => 140000,
                'salary_currency' => 'USD',
                'address'        => '350 5th Avenue, Suite 2100',
                'city'           => 'New York',
                'state'          => 'New York',
                'zip_code'       => '10118',
                'linkedin_url'   => 'https://linkedin.com/in/marcusjohnson',
                'skills'         => ['Product Strategy', 'Agile', 'Data Analysis', 'SQL', 'Jira', 'Roadmapping'],
                'education'      => [
                    ['degree' => 'B.A. in Economics', 'institution' => 'NYU', 'year' => '2012'],
                    ['degree' => 'MBA', 'institution' => 'Columbia Business School', 'year' => '2016'],
                ],
                'experience'     => [
                    ['company' => 'McKinsey & Company', 'role' => 'Business Analyst', 'from' => '2012', 'to' => '2014', 'description' => 'Consulted for Fortune 500 tech companies on digital strategy.'],
                    ['company' => 'Spotify', 'role' => 'Product Manager', 'from' => '2016', 'to' => '2021', 'description' => 'Owned the discovery and personalization features for 100M+ users.'],
                ],
                'emergency_contact_name'  => 'Lisa Johnson',
                'emergency_contact_phone' => '+1 212-555-0100',
            ],
        ];

        $balanceService = app(LeaveBalanceService::class);

        foreach ($employees as $i => $data) {
            if (User::where('email', $data['email'])->exists()) {
                continue;
            }

            // Assign to departments round-robin
            $dept = $departments[$i % $departments->count()];
            $data['department_id'] = $dept->id;
            $data['leave_group_id'] = $defaultGroup->id;
            $data['is_active'] = true;

            $user = User::create($data);
            $balanceService->provisionForUser($user);
        }
    }
}
