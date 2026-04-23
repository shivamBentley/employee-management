<?php

namespace App\Modules\User\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'department_id', 'position', 'phone',
        'bio', 'avatar', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    public function department()
    {
        return $this->belongsTo(\App\Modules\Department\Models\Department::class);
    }

    public function presence()
    {
        return $this->hasOne(\App\Modules\Presence\Models\Presence::class);
    }

    public function leaves()
    {
        return $this->hasMany(\App\Modules\Leave\Models\Leave::class);
    }

    public function notifications()
    {
        return $this->hasMany(\App\Modules\Notification\Models\Notification::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
