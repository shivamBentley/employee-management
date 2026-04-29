<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2)->index();
            $table->string('country_name');
            $table->string('name');
            $table->date('date');
            $table->text('description')->nullable();
            $table->smallInteger('year')->index();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['country_code', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
