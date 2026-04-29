<?php

namespace App\Modules\LeaveGroup\Models;

use App\Modules\LeaveType\Models\LeaveType;
use Illuminate\Database\Eloquent\Model;

class LeaveGroup extends Model
{
    protected $fillable = ['name', 'description', 'is_default', 'is_active'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(LeaveGroupItem::class);
    }

    public function leaveTypes()
    {
        return $this->belongsToMany(LeaveType::class, 'leave_group_items')
                    ->withPivot('balance')
                    ->withTimestamps();
    }

    public function users()
    {
        return $this->hasMany(\App\Modules\User\Models\User::class);
    }
}
