<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Exports\EmployeesExport;
use App\Modules\Leave\Models\Leave;
use App\Modules\User\Models\User;
use App\Modules\Department\Models\Department;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();

        $totalEmployees = User::where('role', 'employee')->count();
        $activeEmployees = User::where('role', 'employee')->where('is_active', true)->count();

        $onLeaveToday = Leave::whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', 'approved')
            ->count();

        $pendingLeaves = Leave::where('status', 'pending')->count();

        $departmentStats = Department::withCount('users')->get()
            ->map(fn($d) => ['name' => $d->name, 'count' => $d->users_count]);

        $leaveStats = Leave::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'total_employees'  => $totalEmployees,
            'active_employees' => $activeEmployees,
            'on_leave_today'   => $onLeaveToday,
            'pending_leaves'   => $pendingLeaves,
            'department_stats' => $departmentStats,
            'leave_stats'      => $leaveStats,
        ]);
    }

    public function exportPdf()
    {
        $users = User::with('department')->get();
        $pdf = Pdf::loadView('reports.employees', compact('users'));
        return $pdf->download('employees-report.pdf');
    }

    public function exportExcel()
    {
        return Excel::download(new EmployeesExport, 'employees-report.xlsx');
    }
}
