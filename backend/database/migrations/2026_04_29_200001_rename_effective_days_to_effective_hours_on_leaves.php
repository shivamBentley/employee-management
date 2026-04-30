<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            if (!Schema::hasColumn('leaves', 'effective_hours')) {
                $table->decimal('effective_hours', 6, 1)->nullable()->after('end_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropColumn('effective_hours');
        });
    }
};
