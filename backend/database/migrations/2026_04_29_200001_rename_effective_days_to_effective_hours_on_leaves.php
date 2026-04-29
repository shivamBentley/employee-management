<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `leaves` CHANGE `effective_days` `effective_hours` DECIMAL(6,1) NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `leaves` CHANGE `effective_hours` `effective_days` DECIMAL(6,1) NULL DEFAULT NULL");
    }
};
