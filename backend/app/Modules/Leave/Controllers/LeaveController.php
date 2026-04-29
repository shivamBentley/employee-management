<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Jobs\SetPresenceOutOfOfficeJob;
use App\Modules\Leave\Models\Leave;
use App\Modules\Leave\Resources\LeaveResource;
use App\Modules\LeaveBalance\Services\LeaveBalanceService;
use App\Modules\LeaveType\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function __construct(private LeaveBalanceService $balanceService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Leave::with(['user', 'approver', 'leaveType']);

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('year')) {
            $query->whereYear('start_date', (int) $request->input('year'));
        }

        if ($request->has('month')) {
            $query->whereMonth('start_date', (int) $request->input('month'));
        }

        return response()->json(['leaves' => LeaveResource::collection($query->latest()->get())]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'start_date'    => ['required', 'date', 'after_or_equal:today'],
            'end_date'      => ['required', 'date', 'after_or_equal:start_date'],
            'reason'        => ['nullable', 'string'],
            'scheduled_at'  => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $leaveType = LeaveType::findOrFail($data['leave_type_id']);

        // Calculate effective hours (excluding weekends and public holidays)
        $calculation = $this->balanceService->calculateLeaveHours(
            \Carbon\Carbon::parse($data['start_date']),
            \Carbon\Carbon::parse($data['end_date']),
            $user->country_code
        );

        if ($calculation['effective_hours'] <= 0) {
            return response()->json(['message' => 'No working hours in the selected date range'], 422);
        }

        // Check balance
        $balance = $user->leaveBalances()
            ->where('leave_type_id', $leaveType->id)
            ->where('year', \Carbon\Carbon::parse($data['start_date'])->year)
            ->first();

        if ($balance && $balance->available < $calculation['effective_hours']) {
            return response()->json([
                'message'   => "Insufficient {$leaveType->name} balance. Available: {$balance->available}h, Requested: {$calculation['effective_hours']}h",
                'available' => $balance->available,
                'requested' => $calculation['effective_hours'],
            ], 422);
        }

        $data['user_id']          = $user->id;
        $data['effective_hours']  = $calculation['effective_hours'];
        $data['type']             = $leaveType->slug; // backward compat

        $leave = Leave::create($data);
        $leave->refresh(); // load DB defaults (status, etc.)

        return response()->json([
            'leave'       => new LeaveResource($leave->load('leaveType')),
            'calculation' => $calculation,
        ], 201);
    }

    public function update(Request $request, Leave $leave): JsonResponse
    {
        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'Only pending leaves can be modified'], 422);
        }

        if (! $request->user()->isAdmin() && $leave->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'leave_type_id' => ['sometimes', 'exists:leave_types,id'],
            'start_date'    => ['sometimes', 'date', 'after_or_equal:today'],
            'end_date'      => ['sometimes', 'date', 'after_or_equal:start_date'],
            'reason'        => ['nullable', 'string'],
        ]);

        $user = $leave->user;
        $startDate = $data['start_date'] ?? $leave->start_date;
        $endDate = $data['end_date'] ?? $leave->end_date;
        $leaveTypeId = $data['leave_type_id'] ?? $leave->leave_type_id;
        $leaveType = LeaveType::findOrFail($leaveTypeId);

        $calculation = $this->balanceService->calculateLeaveHours(
            \Carbon\Carbon::parse($startDate),
            \Carbon\Carbon::parse($endDate),
            $user->country_code
        );

        if ($calculation['effective_hours'] <= 0) {
            return response()->json(['message' => 'No working hours in the selected date range'], 422);
        }

        $balance = $user->leaveBalances()
            ->where('leave_type_id', $leaveType->id)
            ->where('year', \Carbon\Carbon::parse($startDate)->year)
            ->first();

        if ($balance && $balance->available < $calculation['effective_hours']) {
            return response()->json([
                'message'   => "Insufficient {$leaveType->name} balance. Available: {$balance->available}h, Requested: {$calculation['effective_hours']}h",
                'available' => $balance->available,
                'requested' => $calculation['effective_hours'],
            ], 422);
        }

        $data['effective_hours'] = $calculation['effective_hours'];
        if (isset($data['leave_type_id'])) {
            $data['type'] = $leaveType->slug;
        }

        $leave->update($data);

        return response()->json([
            'leave'       => new LeaveResource($leave->fresh()->load(['user', 'approver', 'leaveType'])),
            'calculation' => $calculation,
        ]);
    }

    public function approve(Request $request, Leave $leave): JsonResponse
    {
        $this->checkAdmin($request);

        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'Only pending leaves can be approved'], 422);
        }

        $leaveType = $leave->leaveType ?? LeaveType::where('slug', $leave->type)->first();

        // Deduct balance
        if ($leaveType && $leave->effective_hours) {
            try {
                $this->balanceService->deduct(
                    $leave->user,
                    $leaveType,
                    (float) $leave->effective_hours,
                    $leave->start_date->year
                );
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }
        }

        $leave->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
        ]);

        // Dispatch job to set presence out_of_office on start_date
        SetPresenceOutOfOfficeJob::dispatch($leave)
            ->delay(now()->diffInSeconds($leave->start_date, false) > 0
                ? $leave->start_date->startOfDay()
                : now());

        return response()->json(['leave' => new LeaveResource($leave->load('approver', 'leaveType'))]);
    }

    public function reject(Request $request, Leave $leave): JsonResponse
    {
        $this->checkAdmin($request);

        if ($leave->status === 'rejected') {
            return response()->json(['message' => 'Leave is already rejected'], 422);
        }

        if ($leave->status === 'approved') {
            $leaveType = $leave->leaveType ?? LeaveType::where('slug', $leave->type)->first();
            if ($leaveType && $leave->effective_hours) {
                $this->balanceService->restore(
                    $leave->user,
                    $leaveType,
                    (float) $leave->effective_hours,
                    $leave->start_date->year
                );
            }
        }

        $leave->update([
            'status'      => 'rejected',
            'approved_by' => $request->user()->id,
        ]);

        return response()->json(['leave' => new LeaveResource($leave->load('leaveType'))]);
    }

    public function destroy(Request $request, Leave $leave): JsonResponse
    {
        if (! $request->user()->isAdmin() && $leave->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($leave->status === 'approved') {
            // Restore balance before cancelling
            $leaveType = $leave->leaveType ?? LeaveType::where('slug', $leave->type)->first();
            if ($leaveType && $leave->effective_hours) {
                $this->balanceService->restore(
                    $leave->user,
                    $leaveType,
                    (float) $leave->effective_hours,
                    $leave->start_date->year
                );
            }
        }

        $leave->delete();
        return response()->json(['message' => 'Leave cancelled']);
    }

    private function checkAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }
    }
}
