<?php

namespace App\Modules\User\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'unique:users'],
            'password'       => ['required', Password::min(8)->mixedCase()->numbers()],
            'role'           => ['sometimes', 'in:admin,employee'],
            'department_id'  => ['nullable', 'exists:departments,id'],
            'country_code'   => ['required', 'string', 'size:2'],
            'leave_group_id' => ['nullable', 'exists:leave_groups,id'],
            'position'       => ['nullable', 'string', 'max:255'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'skills'         => ['nullable', 'array'],
            'skills.*'       => ['string', 'max:100'],
            'address'        => ['nullable', 'string', 'max:500'],
            'city'           => ['nullable', 'string', 'max:100'],
            'state'          => ['nullable', 'string', 'max:100'],
            'zip_code'       => ['nullable', 'string', 'max:20'],
            'education'      => ['nullable', 'array'],
            'education.*.degree'      => ['required_with:education', 'string', 'max:255'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.year'        => ['nullable', 'string', 'max:10'],
            'experience'     => ['nullable', 'array'],
            'experience.*.company'   => ['required_with:experience', 'string', 'max:255'],
            'experience.*.role'      => ['required_with:experience', 'string', 'max:255'],
            'experience.*.from'      => ['nullable', 'string', 'max:10'],
            'experience.*.to'        => ['nullable', 'string', 'max:10'],
            'experience.*.description' => ['nullable', 'string'],
            'team_name'      => ['nullable', 'string', 'max:255'],
            'salary'         => ['nullable', 'numeric', 'min:0'],
            'salary_currency'=> ['nullable', 'string', 'size:3'],
            'date_of_joining'=> ['nullable', 'date'],
            'date_of_birth'  => ['nullable', 'date'],
            'linkedin_url'   => ['nullable', 'url', 'max:500'],
            'emergency_contact_name'  => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
