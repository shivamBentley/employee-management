<?php

namespace App\Modules\LeaveType\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LeaveType extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'default_balance', 'is_paid', 'is_active',
    ];

    protected $casts = [
        'default_balance' => 'decimal:1',
        'is_paid'         => 'boolean',
        'is_active'       => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (LeaveType $leaveType) {
            if (empty($leaveType->slug)) {
                $leaveType->slug = Str::slug($leaveType->name);
            }
        });

        static::updating(function (LeaveType $leaveType) {
            if ($leaveType->isDirty('name')) {
                $leaveType->slug = Str::slug($leaveType->name);
            }
        });
    }
}
