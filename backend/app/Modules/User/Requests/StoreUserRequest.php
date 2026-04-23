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
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'unique:users'],
            'password'      => ['required', Password::min(8)->mixedCase()->numbers()],
            'role'          => ['sometimes', 'in:admin,employee'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position'      => ['nullable', 'string', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:20'],
        ];
    }
}
