<?php

namespace App\Modules\Department\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'description'];

    public function users()
    {
        return $this->hasMany(\App\Modules\User\Models\User::class);
    }
}
