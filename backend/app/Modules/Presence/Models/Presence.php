<?php

namespace App\Modules\Presence\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    protected $table = 'presence';

    protected $fillable = ['user_id', 'status', 'last_seen'];

    protected $casts = ['last_seen' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(\App\Modules\User\Models\User::class);
    }
}
