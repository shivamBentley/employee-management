<?php

namespace App\Modules\LeaveBalance\Models;

use App\Modules\LeaveType\Models\LeaveType;
use App\Modules\User\Models\User;
use Illuminate\Database\Eloquent\Model;

class UserLeaveBalance extends Model
{
    protected $fillable = [
        'user_id', 'leave_type_id', 'allocated', 'used', 'carried_forward', 'year',
    ];

    protected $casts = [
        'allocated'        => 'decimal:1',
        'used'             => 'decimal:1',
        'carried_forward'  => 'decimal:1',
    ];

    protected $appends = ['available'];

    /**
     * Available balance in hours.
     */
    public function getAvailableAttribute(): float
    {
        return round((float) $this->allocated + (float) $this->carried_forward - (float) $this->used, 1);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}
