<?php

namespace App\Modules\LeaveBalance\Resources;

use App\Modules\LeaveType\Resources\LeaveTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserLeaveBalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'leave_type_id'   => $this->leave_type_id,
            'allocated'       => $this->allocated,
            'used'            => $this->used,
            'carried_forward' => $this->carried_forward,
            'available'       => $this->available,
            'year'            => $this->year,
            'leave_type'      => new LeaveTypeResource($this->whenLoaded('leaveType')),
        ];
    }
}
