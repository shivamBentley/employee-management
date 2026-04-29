<?php

namespace App\Modules\Holiday\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HolidayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'country_code' => $this->country_code,
            'country_name' => $this->country_name,
            'name'         => $this->name,
            'date'         => $this->date,
            'description'  => $this->description,
            'year'         => $this->year,
            'is_active'    => $this->is_active,
            'created_at'   => $this->created_at,
        ];
    }
}
