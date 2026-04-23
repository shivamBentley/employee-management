<?php

namespace App\Modules\User\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'role'          => $this->role,
            'position'      => $this->position,
            'phone'         => $this->phone,
            'bio'           => $this->bio,
            'avatar'        => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'is_active'     => $this->is_active,
            'department'    => $this->whenLoaded('department'),
            'presence'      => $this->whenLoaded('presence'),
            'created_at'    => $this->created_at,
        ];
    }
}
