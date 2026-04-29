<?php

namespace App\Modules\LeaveBalance\Services;

use App\Modules\Holiday\Models\Holiday;
use App\Modules\LeaveBalance\Models\UserLeaveBalance;
use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\LeaveType\Models\LeaveType;
use App\Modules\User\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveBalanceService
{
    /**
     * Provision leave balances for a single user based on their leave group.
     */
    public function provisionForUser(User $user, ?int $year = null): void
    {
        $year = $year ?? now()->year;
        $group = $user->leaveGroup;

        if (! $group) {
            $group = LeaveGroup::where('is_default', true)->first();
            if (! $group) {
                return;
            }
        }

        $group->load('items');

        foreach ($group->items as $item) {
            UserLeaveBalance::updateOrCreate(
                [
                    'user_id'       => $user->id,
                    'leave_type_id' => $item->leave_type_id,
                    'year'          => $year,
                ],
                [
                    'allocated' => $item->balance,
                ]
            );
        }
    }

    /**
     * Provision leave balances for all active users for a given year.
     */
    public function provisionAllUsersForYear(int $year): int
    {
        $users = User::where('is_active', true)->get();
        $count = 0;

        foreach ($users as $user) {
            $this->provisionForUser($user, $year);
            $count++;
        }

        return $count;
    }

    /**
     * Deduct leave hours from user's balance.
     *
     * @throws \Exception if insufficient balance
     */
    public function deduct(User $user, LeaveType $leaveType, float $hours, ?int $year = null): UserLeaveBalance
    {
        $year = $year ?? now()->year;

        $balance = UserLeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $year)
            ->first();

        if (! $balance) {
            throw new \Exception("No leave balance found for {$leaveType->name} in {$year}");
        }

        if ($balance->available < $hours) {
            throw new \Exception("Insufficient {$leaveType->name} balance. Available: {$balance->available}h, Requested: {$hours}h");
        }

        $balance->increment('used', $hours);
        return $balance->fresh();
    }

    /**
     * Restore leave hours to user's balance (on cancel/reject).
     */
    public function restore(User $user, LeaveType $leaveType, float $hours, ?int $year = null): ?UserLeaveBalance
    {
        $year = $year ?? now()->year;

        $balance = UserLeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', $year)
            ->first();

        if ($balance) {
            $balance->decrement('used', min($hours, (float) $balance->used));
            return $balance->fresh();
        }

        return null;
    }

    /**
     * Calculate effective leave hours excluding weekends and public holidays.
     * 1 working day = 8 hours.
     */
    public function calculateLeaveHours(Carbon $startDate, Carbon $endDate, ?string $countryCode = null): array
    {
        $period = CarbonPeriod::create($startDate, $endDate);
        $totalDays = 0;
        $holidayDays = 0;
        $weekendDays = 0;
        $holidayNames = [];

        // Get public holidays in range for the user's country
        $holidays = collect();
        if ($countryCode) {
            $holidays = Holiday::forCountry($countryCode)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('is_active', true)
                ->get()
                ->pluck('name', 'date');
        }

        foreach ($period as $date) {
            if ($date->isWeekend()) {
                $weekendDays++;
                continue;
            }

            $dateStr = $date->toDateString();
            if ($holidays->has($dateStr)) {
                $holidayDays++;
                $holidayNames[] = [
                    'date' => $dateStr,
                    'name' => $holidays->get($dateStr),
                ];
                continue;
            }

            $totalDays++;
        }

        return [
            'effective_hours'     => $totalDays * 8,
            'effective_days'      => $totalDays,
            'weekend_days'        => $weekendDays,
            'holiday_days'        => $holidayDays,
            'holidays'            => $holidayNames,
            'total_calendar_days' => $period->count(),
        ];
    }

    /**
     * Get all balances for a user in a given year.
     */
    public function getBalances(User $user, ?int $year = null): \Illuminate\Database\Eloquent\Collection
    {
        $year = $year ?? now()->year;

        return UserLeaveBalance::with('leaveType')
            ->where('user_id', $user->id)
            ->where('year', $year)
            ->get();
    }

    /**
     * Get monthly usage breakdown for a user.
     */
    public function getMonthlyUsage(int $userId, int $year, ?int $month = null): array
    {
        $query = \App\Modules\Leave\Models\Leave::where('user_id', $userId)
            ->where('status', 'approved')
            ->whereYear('start_date', $year);

        if ($month) {
            $query->whereMonth('start_date', $month);
        }

        $leaves = $query->with('leaveType')->get();

        $usage = [];
        foreach ($leaves as $leave) {
            $typeName = $leave->leaveType ? $leave->leaveType->name : ($leave->type ?? 'Unknown');
            $key = $leave->leave_type_id ?? $leave->type;

            if (! isset($usage[$key])) {
                $usage[$key] = [
                    'leave_type'    => $typeName,
                    'leave_type_id' => $leave->leave_type_id,
                    'hours'         => 0,
                    'count'         => 0,
                ];
            }

            $usage[$key]['hours'] += (float) ($leave->effective_hours ?? (($leave->start_date->diffInWeekdays($leave->end_date) + 1) * 8));
            $usage[$key]['count']++;
        }

        return array_values($usage);
    }
}
