<?php

namespace App\Modules\LeaveBalance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\LeaveBalance\Resources\UserLeaveBalanceResource;
use App\Modules\LeaveBalance\Services\LeaveBalanceService;
use App\Modules\User\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveBalanceController extends Controller
{
    public function __construct(private LeaveBalanceService $service) {}

    public function index(Request $request): JsonResponse
    {
        $year = (int) $request->input('year', now()->year);
        $user = $request->user();

        if ($request->user()->isAdmin() && $request->has('user_id')) {
            $user = User::findOrFail($request->input('user_id'));
        }

        $balances = $this->service->getBalances($user, $year);

        return response()->json([
            'balances' => UserLeaveBalanceResource::collection($balances),
            'year'     => $year,
        ]);
    }

    public function monthly(Request $request): JsonResponse
    {
        $year  = (int) $request->input('year', now()->year);
        $month = $request->has('month') ? (int) $request->input('month') : null;
        $user  = $request->user();

        if ($request->user()->isAdmin() && $request->has('user_id')) {
            $user = User::findOrFail($request->input('user_id'));
        }

        $usage = $this->service->getMonthlyUsage($user->id, $year, $month);

        return response()->json([
            'usage' => $usage,
            'year'  => $year,
            'month' => $month,
        ]);
    }

    public function provision(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }

        $year = (int) $request->input('year', now()->year);
        $count = $this->service->provisionAllUsersForYear($year);

        return response()->json([
            'message' => "Provisioned leave balances for {$count} users for year {$year}",
            'count'   => $count,
            'year'    => $year,
        ]);
    }

    public function calculate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $countryCode = $request->user()->country_code;
        $result = $this->service->calculateLeaveHours(
            \Carbon\Carbon::parse($data['start_date']),
            \Carbon\Carbon::parse($data['end_date']),
            $countryCode
        );

        return response()->json($result);
    }
}
