<?php

namespace Database\Seeders;

use App\Modules\Setting\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'leave_management_enabled',   'value' => '1', 'scope' => 'global'],
            ['key' => 'announcements_enabled',       'value' => '1', 'scope' => 'global'],
            ['key' => 'presence_tracking_enabled',   'value' => '1', 'scope' => 'global'],
            ['key' => 'backup_enabled',              'value' => '1', 'scope' => 'admin'],
        ];

        foreach ($defaults as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
