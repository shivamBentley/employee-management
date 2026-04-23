<?php

namespace App\Modules\Leave\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    protected $fillable = [
        'user_id', 'type', 'start_date', 'end_date',
        'status', 'reason', 'approved_by', 'scheduled_at',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'scheduled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Modules\User\Models\User::class);
    }

    public function approver()
    {
        return $this->belongsTo(\App\Modules\User\Models\User::class, 'approved_by');
    }
}
