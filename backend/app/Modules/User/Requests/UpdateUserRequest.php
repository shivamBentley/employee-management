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
            // Admin-only fields
            'department_id' => ['sometimes', 'nullable', 'exists:departments,id', $isAdmin ? '' : 'prohibited'],
            'is_active'     => ['sometimes', 'boolean', $isAdmin ? '' : 'prohibited'],
            'role'          => ['sometimes', 'in:admin,employee', $isAdmin ? '' : 'prohibited'],
        ];
    }
}
