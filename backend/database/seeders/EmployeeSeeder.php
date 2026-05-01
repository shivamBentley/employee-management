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
                'name'      => 'Arjun Mehta',
                'email'     => 'arjun.mehta@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'Backend Engineer',
                'phone'     => '+91 99001 12345',
                'bio'       => 'Backend engineer specializing in scalable APIs and microservices. AWS Certified Developer. Loves cricket and open-source contributions.',
                'country_code'   => 'IN',
                'team_name'      => 'Core Services',
                'date_of_joining' => '2022-01-10',
                'date_of_birth'  => '1991-11-05',
                'salary'         => 1250000,
                'salary_currency' => 'INR',
                'address'        => '301, Koregaon Park',
                'city'           => 'Pune',
                'state'          => 'Maharashtra',
                'zip_code'       => '411001',
                'linkedin_url'   => 'https://linkedin.com/in/arjunmehta',
                'skills'         => ['PHP', 'Laravel', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
                'education'      => [
                    ['degree' => 'B.Tech in Computer Science', 'institution' => 'BITS Pilani', 'year' => '2013'],
                ],
                'experience'     => [
                    ['company' => 'Wipro', 'role' => 'Software Engineer', 'from' => '2013', 'to' => '2017', 'description' => 'Built REST APIs for banking and insurance clients.'],
                    ['company' => 'Razorpay', 'role' => 'Senior Engineer', 'from' => '2017', 'to' => '2022', 'description' => 'Developed payment processing microservices handling crores of daily transactions.'],
                ],
                'emergency_contact_name'  => 'Sunita Mehta',
                'emergency_contact_phone' => '+91 99001 00001',
            ],
            [
                'name'      => 'Sneha Iyer',
                'email'     => 'sneha.iyer@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'UX Designer',
                'phone'     => '+91 88001 23456',
                'bio'       => 'UX designer focused on creating intuitive and accessible experiences. Previously at Swiggy. Advocate for inclusive design and design systems.',
                'country_code'   => 'IN',
                'team_name'      => 'Design',
                'date_of_joining' => '2023-06-01',
                'date_of_birth'  => '1996-02-14',
                'salary'         => 900000,
                'salary_currency' => 'INR',
                'address'        => '22, Koramangala 5th Block',
                'city'           => 'Bangalore',
                'state'          => 'Karnataka',
                'zip_code'       => '560095',
                'skills'         => ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Adobe XD', 'Accessibility'],
                'education'      => [
                    ['degree' => 'B.Des in Visual Communication', 'institution' => 'NID Ahmedabad', 'year' => '2018'],
                    ['degree' => 'PG Diploma in UX Design', 'institution' => 'Interaction Design Foundation', 'year' => '2019'],
                ],
                'experience'     => [
                    ['company' => 'Swiggy', 'role' => 'Product Designer', 'from' => '2018', 'to' => '2023', 'description' => 'Led the redesign of the restaurant partner dashboard, improving task completion rate by 35%.'],
                ],
                'emergency_contact_name'  => 'Ramesh Iyer',
                'emergency_contact_phone' => '+91 88001 00000',
            ],
            [
                'name'      => 'Vikram Nair',
                'email'     => 'vikram.nair@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'DevOps Lead',
                'phone'     => '+91 97001 34567',
                'bio'       => 'DevOps engineer passionate about CI/CD pipelines, infrastructure as code, and site reliability. Kubernetes enthusiast and open-source contributor.',
                'country_code'   => 'IN',
                'team_name'      => 'Infrastructure',
                'date_of_joining' => '2020-09-01',
                'date_of_birth'  => '1989-08-30',
                'salary'         => 1400000,
                'salary_currency' => 'INR',
                'address'        => '7, Jubilee Hills Road No. 36',
                'city'           => 'Hyderabad',
                'state'          => 'Telangana',
                'zip_code'       => '500033',
                'linkedin_url'   => 'https://linkedin.com/in/vikramnair',
                'skills'         => ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'CI/CD', 'Prometheus', 'Go'],
                'education'      => [
                    ['degree' => 'B.Tech in Information Technology', 'institution' => 'NIT Trichy', 'year' => '2011'],
                    ['degree' => 'M.Tech in Distributed Systems', 'institution' => 'IIT Bombay', 'year' => '2013'],
                ],
                'experience'     => [
                    ['company' => 'HCL Technologies', 'role' => 'Systems Engineer', 'from' => '2013', 'to' => '2016', 'description' => 'Managed on-premises infrastructure for enterprise banking clients.'],
                    ['company' => 'Myntra', 'role' => 'Senior DevOps Engineer', 'from' => '2016', 'to' => '2020', 'description' => 'Built and maintained Kubernetes clusters serving millions of daily users.'],
                ],
                'emergency_contact_name'  => 'Lakshmi Nair',
                'emergency_contact_phone' => '+91 97001 00000',
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
                'name'      => 'Rohan Desai',
                'email'     => 'rohan.desai@company.com',
                'password'  => 'Employee@123',
                'role'      => 'employee',
                'position'  => 'Product Manager',
                'phone'     => '+91 96001 56789',
                'bio'       => 'Product manager bridging business and engineering. Data-driven decision maker with an MBA background. Previously at Zomato and OYO.',
                'country_code'   => 'IN',
                'team_name'      => 'Product',
                'date_of_joining' => '2021-11-01',
                'date_of_birth'  => '1990-04-18',
                'salary'         => 1800000,
                'salary_currency' => 'INR',
                'address'        => '12, Sector 62',
                'city'           => 'Noida',
                'state'          => 'Uttar Pradesh',
                'zip_code'       => '201309',
                'linkedin_url'   => 'https://linkedin.com/in/rohandesai',
                'skills'         => ['Product Strategy', 'Agile', 'Data Analysis', 'SQL', 'Jira', 'Roadmapping'],
                'education'      => [
                    ['degree' => 'B.Tech in Electronics', 'institution' => 'IIT Roorkee', 'year' => '2012'],
                    ['degree' => 'MBA', 'institution' => 'IIM Ahmedabad', 'year' => '2016'],
                ],
                'experience'     => [
                    ['company' => 'Zomato', 'role' => 'Associate Product Manager', 'from' => '2016', 'to' => '2019', 'description' => 'Owned the restaurant discovery and recommendations feature.'],
                    ['company' => 'OYO', 'role' => 'Product Manager', 'from' => '2019', 'to' => '2021', 'description' => 'Led growth product initiatives across India and Southeast Asia.'],
                ],
                'emergency_contact_name'  => 'Meena Desai',
                'emergency_contact_phone' => '+91 96001 00000',
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
