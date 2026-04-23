<?php

namespace App\Modules\Leave\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'type'         => $this->type,
            'start_date'   => $this->start_date,
            'end_date'     => $this->end_date,
            'status'       => $this->status,
            'reason'       => $this->reason,
            'scheduled_at' => $this->scheduled_at,
            'user'         => $this->whenLoaded('user'),
            'approver'     => $this->whenLoaded('approver'),
            'created_at'   => $this->created_at,
        ];
    }
}
