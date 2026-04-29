<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Exports\EmployeesExport;
use App\Modules\Leave\Models\Leave;
use App\Modules\LeaveBalance\Models\UserLeaveBalance;
use App\Modules\LeaveBalance\Resources\UserLeaveBalanceResource;
use App\Modules\User\Models\User;
use App\Modules\Department\Models\Department;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function leaveSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $year = (int) $request->input('year', now()->year);
        $today = Carbon::today();

        // User's leave balances for the year
        $balances = UserLeaveBalance::with('leaveType')
            ->where('user_id', $user->id)
            ->where('year', $year)
            ->get();

        // Next upcoming approved leave
        $nextLeave = Leave::with('leaveType')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('start_date', '>', $today)
            ->orderBy('start_date')
            ->first();

        // Monthly usage for the year
        $monthlyUsage = Leave::where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->get()
            ->groupBy(fn($l) => $l->start_date->month)
            ->map(fn($leaves) => [
                'count' => $leaves->count(),
                'hours' => $leaves->sum('effective_hours'),
            ]);

        $result = [
            'balances'      => UserLeaveBalanceResource::collection($balances),
            'next_leave'    => $nextLeave ? [
                'id'         => $nextLeave->id,
                'type'       => $nextLeave->leaveType?->name ?? $nextLeave->type,
                'start_date' => $nextLeave->start_date,
                'end_date'   => $nextLeave->end_date,
                'hours'      => $nextLeave->effective_hours,
            ] : null,
            'monthly_usage' => $monthlyUsage,
            'year'          => $year,
        ];

        // Admin gets additional org-wide stats
        if ($user->isAdmin()) {
            $result['org_pending_count'] = Leave::where('status', 'pending')->count();
            $result['org_on_leave_today'] = Leave::whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->where('status', 'approved')
                ->count();
            $result['org_pending_leaves'] = Leave::with(['user', 'leaveType'])
                ->where('status', 'pending')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($l) => [
                    'id'         => $l->id,
                    'user'       => $l->user?->name,
                    'type'       => $l->leaveType?->name ?? $l->type,
                    'start_date' => $l->start_date,
                    'end_date'   => $l->end_date,
                    'hours'      => $l->effective_hours,
                ]);
        }

        return response()->json($result);
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
