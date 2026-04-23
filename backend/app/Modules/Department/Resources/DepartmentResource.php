<?php

namespace App\Modules\Department\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'user_count'  => $this->users_count ?? 0,
            'created_at'  => $this->created_at,
        ];
    }
}
