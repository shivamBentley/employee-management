<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->foreignId('leave_type_id')->nullable()->after('user_id')
                  ->constrained('leave_types')->nullOnDelete();
            $table->decimal('effective_hours', 6, 1)->nullable()->after('end_date');
        });
    }

    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropForeign(['leave_type_id']);
            $table->dropColumn(['leave_type_id', 'effective_hours']);
        });
    }
};
