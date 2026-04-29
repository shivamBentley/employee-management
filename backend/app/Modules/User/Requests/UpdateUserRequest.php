<?php

namespace App\Modules\User\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Policy enforces ownership/admin check
    }

    public function rules(): array
    {
        $isAdmin = $this->user()?->isAdmin();

        return [
            'name'          => ['sometimes', 'string', 'max:255'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:20'],
            'bio'           => ['sometimes', 'nullable', 'string'],
            'position'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'avatar'        => ['sometimes', 'nullable', 'image', 'max:2048'],
            'country_code'  => ['sometimes', 'string', 'size:2'],
            'skills'        => ['sometimes', 'nullable', 'array'],
            'skills.*'      => ['string', 'max:100'],
            'address'       => ['sometimes', 'nullable', 'string', 'max:500'],
            'city'          => ['sometimes', 'nullable', 'string', 'max:100'],
            'state'         => ['sometimes', 'nullable', 'string', 'max:100'],
            'zip_code'      => ['sometimes', 'nullable', 'string', 'max:20'],
            'education'     => ['sometimes', 'nullable', 'array'],
            'education.*.degree'      => ['required_with:education', 'string', 'max:255'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.year'        => ['nullable', 'string', 'max:10'],
            'experience'    => ['sometimes', 'nullable', 'array'],
            'experience.*.company'   => ['required_with:experience', 'string', 'max:255'],
            'experience.*.role'      => ['required_with:experience', 'string', 'max:255'],
            'experience.*.from'      => ['nullable', 'string', 'max:10'],
            'experience.*.to'        => ['nullable', 'string', 'max:10'],
            'experience.*.description' => ['nullable', 'string'],
            'team_name'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_of_joining' => ['sometimes', 'nullable', 'date'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'linkedin_url'  => ['sometimes', 'nullable', 'url', 'max:500'],
            'emergency_contact_name'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            // Admin-only fields
            'department_id' => ['sometimes', 'nullable', 'exists:departments,id', $isAdmin ? '' : 'prohibited'],
            'is_active'     => ['sometimes', 'boolean', $isAdmin ? '' : 'prohibited'],
            'role'          => ['sometimes', 'in:admin,employee', $isAdmin ? '' : 'prohibited'],
            'salary'        => ['sometimes', 'nullable', 'numeric', 'min:0', $isAdmin ? '' : 'prohibited'],
            'salary_currency' => ['sometimes', 'nullable', 'string', 'size:3', $isAdmin ? '' : 'prohibited'],
        ];
    }
}
