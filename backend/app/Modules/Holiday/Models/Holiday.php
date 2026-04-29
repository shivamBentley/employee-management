<?php

namespace App\Modules\Holiday\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'country_code', 'country_name', 'name', 'date', 'description', 'year', 'is_active',
    ];

    protected $casts = [
        'date'      => 'date',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Holiday $holiday) {
            if (empty($holiday->year) && $holiday->date) {
                $holiday->year = $holiday->date->year;
            }
        });

        static::updating(function (Holiday $holiday) {
            if ($holiday->isDirty('date') && $holiday->date) {
                $holiday->year = $holiday->date->year;
            }
        });
    }

    public function scopeForCountry($query, string $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    public function scopeForYear($query, int $year)
    {
        return $query->where('year', $year);
    }
}
