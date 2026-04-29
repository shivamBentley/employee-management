<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change enum to varchar so any leave-type slug is accepted
        DB::statement("ALTER TABLE `leaves` MODIFY `type` VARCHAR(50) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `leaves` MODIFY `type` ENUM('casual','sick','annual','wfh') NOT NULL");
    }
};
