<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Jobs\SetPresenceOutOfOfficeJob;
use App\Modules\Leave\Models\Leave;
use App\Modules\Leave\Resources\LeaveResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Leave::with(['user', 'approver']);

        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json(['leaves' => LeaveResource::collection($query->latest()->get())]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'         => ['required', 'in:casual,sick,annual,wfh'],
            'start_date'   => ['required', 'date', 'after_or_equal:today'],
            'end_date'     => ['required', 'date', 'after_or_equal:start_date'],
            'reason'       => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $data['user_id'] = $request->user()->id;
        $leave = Leave::create($data);

        return response()->json(['leave' => new LeaveResource($leave)], 201);
    }

    public function approve(Request $request, Leave $leave): JsonResponse
    {
        $this->checkAdmin($request);

        $leave->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
        ]);

        // Dispatch job to set presence out_of_office on start_date
        SetPresenceOutOfOfficeJob::dispatch($leave)
            ->delay(now()->diffInSeconds($leave->start_date, false) > 0
                ? $leave->start_date->startOfDay()
                : now());

        return response()->json(['leave' => new LeaveResource($leave->load('approver'))]);
    }

    public function reject(Request $request, Leave $leave): JsonResponse
    {
        $this->checkAdmin($request);

        $leave->update([
            'status'      => 'rejected',
            'approved_by' => $request->user()->id,
        ]);

        return response()->json(['leave' => new LeaveResource($leave)]);
    }

    public function destroy(Request $request, Leave $leave): JsonResponse
    {
        if (! $request->user()->isAdmin() && $leave->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($leave->status === 'approved') {
            return response()->json(['message' => 'Cannot cancel an approved leave'], 422);
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
