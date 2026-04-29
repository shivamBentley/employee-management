<?php

namespace App\Modules\LeaveGroup\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'is_default'  => $this->is_default,
            'is_active'   => $this->is_active,
            'items'       => LeaveGroupItemResource::collection($this->whenLoaded('items')),
            'user_count'  => $this->users_count ?? 0,
            'created_at'  => $this->created_at,
        ];
    }
}
