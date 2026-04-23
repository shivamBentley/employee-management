<?php

namespace App\Modules\Dashboard\Exports;

use App\Modules\User\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return User::with('department')
            ->get()
            ->map(fn($u) => [
                $u->id,
                $u->name,
                $u->email,
                $u->role,
                $u->department?->name ?? '-',
                $u->position ?? '-',
                $u->is_active ? 'Active' : 'Inactive',
                $u->created_at->format('Y-m-d'),
            ]);
    }

    public function headings(): array
    {
        return ['ID', 'Name', 'Email', 'Role', 'Department', 'Position', 'Status', 'Joined'];
    }
}
