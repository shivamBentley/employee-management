<?php

namespace App\Modules\Announcement\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'author_id'];

    public function author()
    {
        return $this->belongsTo(\App\Modules\User\Models\User::class, 'author_id');
    }
}
