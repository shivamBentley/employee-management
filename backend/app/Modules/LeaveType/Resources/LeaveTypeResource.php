<?php

namespace App\Modules\LeaveType\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'slug'            => $this->slug,
            'description'     => $this->description,
            'default_balance' => $this->default_balance,
            'is_paid'         => $this->is_paid,
            'is_active'       => $this->is_active,
            'created_at'      => $this->created_at,
        ];
    }
}
