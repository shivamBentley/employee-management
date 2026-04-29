<?php

namespace App\Modules\User\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'role'           => $this->role,
            'position'       => $this->position,
            'phone'          => $this->phone,
            'bio'            => $this->bio,
            'avatar'         => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'is_active'      => $this->is_active,
            'country_code'   => $this->country_code,
            'leave_group_id' => $this->leave_group_id,
            'skills'         => $this->skills,
            'address'        => $this->address,
            'city'           => $this->city,
            'state'          => $this->state,
            'zip_code'       => $this->zip_code,
            'education'      => $this->education,
            'experience'     => $this->experience,
            'team_name'      => $this->team_name,
            'salary'         => $this->salary,
            'salary_currency'=> $this->salary_currency,
            'date_of_joining' => $this->date_of_joining?->format('Y-m-d'),
            'date_of_birth'  => $this->date_of_birth?->format('Y-m-d'),
            'linkedin_url'   => $this->linkedin_url,
            'emergency_contact_name'  => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'department'     => $this->whenLoaded('department'),
            'leave_group'    => $this->whenLoaded('leaveGroup'),
            'presence'       => $this->whenLoaded('presence'),
            'created_at'     => $this->created_at,
        ];
    }
}
