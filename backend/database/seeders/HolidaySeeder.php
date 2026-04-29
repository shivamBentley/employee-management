<?php

namespace Database\Seeders;

use App\Modules\Holiday\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            // ── India (IN) ──────────────────────────────────────────────────
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Republic Day',           'date' => '2026-01-26'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Holi',                   'date' => '2026-03-17'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Good Friday',            'date' => '2026-04-03'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Eid ul-Fitr',            'date' => '2026-03-21'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Independence Day',       'date' => '2026-08-15'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Gandhi Jayanti',         'date' => '2026-10-02'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Dussehra',               'date' => '2026-10-20'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Diwali',                 'date' => '2026-11-08'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Christmas Day',          'date' => '2026-12-25'],

            // ── India 2027 ──────────────────────────────────────────────────
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Republic Day',           'date' => '2027-01-26'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Holi',                   'date' => '2027-03-07'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Good Friday',            'date' => '2027-03-26'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Independence Day',       'date' => '2027-08-15'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Gandhi Jayanti',         'date' => '2027-10-02'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Diwali',                 'date' => '2027-10-29'],
            ['country_code' => 'IN', 'country_name' => 'India', 'name' => 'Christmas Day',          'date' => '2027-12-25'],

            // ── United States (US) ──────────────────────────────────────────
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => "New Year's Day",          'date' => '2026-01-01'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Martin Luther King Jr. Day', 'date' => '2026-01-19'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => "Presidents' Day",         'date' => '2026-02-16'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Memorial Day',            'date' => '2026-05-25'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Independence Day',        'date' => '2026-07-04'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Labor Day',               'date' => '2026-09-07'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Thanksgiving Day',        'date' => '2026-11-26'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Christmas Day',           'date' => '2026-12-25'],

            // ── US 2027 ─────────────────────────────────────────────────────
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => "New Year's Day",          'date' => '2027-01-01'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Martin Luther King Jr. Day', 'date' => '2027-01-18'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Memorial Day',            'date' => '2027-05-31'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Independence Day',        'date' => '2027-07-04'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Thanksgiving Day',        'date' => '2027-11-25'],
            ['country_code' => 'US', 'country_name' => 'United States', 'name' => 'Christmas Day',           'date' => '2027-12-25'],

            // ── United Kingdom (GB) ─────────────────────────────────────────
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => "New Year's Day",         'date' => '2026-01-01'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Good Friday',            'date' => '2026-04-03'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Easter Monday',          'date' => '2026-04-06'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Early May Bank Holiday', 'date' => '2026-05-04'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Spring Bank Holiday',    'date' => '2026-05-25'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Summer Bank Holiday',    'date' => '2026-08-31'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Christmas Day',          'date' => '2026-12-25'],
            ['country_code' => 'GB', 'country_name' => 'United Kingdom', 'name' => 'Boxing Day',             'date' => '2026-12-28'],

            // ── Canada (CA) ─────────────────────────────────────────────────
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => "New Year's Day",        'date' => '2026-01-01'],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Good Friday',           'date' => '2026-04-03'],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Canada Day',            'date' => '2026-07-01'],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Labour Day',            'date' => '2026-09-07'],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Thanksgiving Day',      'date' => '2026-10-12'],
            ['country_code' => 'CA', 'country_name' => 'Canada', 'name' => 'Christmas Day',         'date' => '2026-12-25'],

            // ── Australia (AU) ──────────────────────────────────────────────
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => "New Year's Day",      'date' => '2026-01-01'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Australia Day',       'date' => '2026-01-26'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Good Friday',         'date' => '2026-04-03'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Easter Monday',       'date' => '2026-04-06'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Anzac Day',           'date' => '2026-04-25'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Christmas Day',       'date' => '2026-12-25'],
            ['country_code' => 'AU', 'country_name' => 'Australia', 'name' => 'Boxing Day',          'date' => '2026-12-28'],

            // ── Germany (DE) ────────────────────────────────────────────────
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => "New Year's Day",        'date' => '2026-01-01'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Good Friday',           'date' => '2026-04-03'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Easter Monday',         'date' => '2026-04-06'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Labour Day',            'date' => '2026-05-01'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'German Unity Day',      'date' => '2026-10-03'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => 'Christmas Day',         'date' => '2026-12-25'],
            ['country_code' => 'DE', 'country_name' => 'Germany', 'name' => '2nd Christmas Day',     'date' => '2026-12-26'],

            // ── Singapore (SG) ──────────────────────────────────────────────
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => "New Year's Day",      'date' => '2026-01-01'],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Chinese New Year',    'date' => '2026-02-17'],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Good Friday',         'date' => '2026-04-03'],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Labour Day',          'date' => '2026-05-01'],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'National Day',        'date' => '2026-08-09'],
            ['country_code' => 'SG', 'country_name' => 'Singapore', 'name' => 'Christmas Day',       'date' => '2026-12-25'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(
                [
                    'country_code' => $holiday['country_code'],
                    'date'         => $holiday['date'],
                ],
                array_merge($holiday, ['is_active' => true])
            );
        }
    }
}
