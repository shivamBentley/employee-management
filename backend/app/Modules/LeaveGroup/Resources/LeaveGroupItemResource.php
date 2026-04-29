<?php

namespace App\Modules\LeaveGroup\Resources;

use App\Modules\LeaveType\Resources\LeaveTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveGroupItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'leave_type_id' => $this->leave_type_id,
            'balance'       => $this->balance,
            'leave_type'    => new LeaveTypeResource($this->whenLoaded('leaveType')),
        ];
    }
}
