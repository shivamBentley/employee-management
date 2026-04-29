<?php

namespace App\Modules\LeaveGroup\Models;

use App\Modules\LeaveType\Models\LeaveType;
use Illuminate\Database\Eloquent\Model;

class LeaveGroupItem extends Model
{
    protected $fillable = ['leave_group_id', 'leave_type_id', 'balance'];

    protected $casts = [
        'balance' => 'decimal:1',
    ];

    public function leaveGroup()
    {
        return $this->belongsTo(LeaveGroup::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}
