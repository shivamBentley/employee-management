<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('skills')->nullable()->after('bio');
            $table->text('address')->nullable()->after('skills');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('state', 100)->nullable()->after('city');
            $table->string('zip_code', 20)->nullable()->after('state');
            $table->json('education')->nullable()->after('zip_code');
            $table->json('experience')->nullable()->after('education');
            $table->string('team_name', 255)->nullable()->after('experience');
            $table->decimal('salary', 12, 2)->nullable()->after('team_name');
            $table->string('salary_currency', 3)->default('USD')->after('salary');
            $table->date('date_of_joining')->nullable()->after('salary_currency');
            $table->date('date_of_birth')->nullable()->after('date_of_joining');
            $table->string('linkedin_url', 500)->nullable()->after('date_of_birth');
            $table->string('emergency_contact_name', 255)->nullable()->after('linkedin_url');
            $table->string('emergency_contact_phone', 20)->nullable()->after('emergency_contact_name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'skills', 'address', 'city', 'state', 'zip_code',
                'education', 'experience', 'team_name',
                'salary', 'salary_currency', 'date_of_joining', 'date_of_birth',
                'linkedin_url', 'emergency_contact_name', 'emergency_contact_phone',
            ]);
        });
    }
};
