<?php

namespace App\Modules\LeaveType\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\LeaveType\Models\LeaveType;
use App\Modules\LeaveType\Resources\LeaveTypeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $leaveTypes = LeaveType::orderBy('name')->get();
        return response()->json(['leave_types' => LeaveTypeResource::collection($leaveTypes)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'name'            => ['required', 'string', 'unique:leave_types', 'max:255'],
            'description'     => ['nullable', 'string'],
            'default_balance' => ['nullable', 'numeric', 'min:0'],
            'is_paid'         => ['nullable', 'boolean'],
        ]);

        $leaveType = LeaveType::create($data);
        return response()->json(['leave_type' => new LeaveTypeResource($leaveType)], 201);
    }

    public function update(Request $request, LeaveType $leaveType): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'name'            => ['sometimes', 'string', 'unique:leave_types,name,' . $leaveType->id, 'max:255'],
            'description'     => ['nullable', 'string'],
            'default_balance' => ['nullable', 'numeric', 'min:0'],
            'is_paid'         => ['nullable', 'boolean'],
            'is_active'       => ['nullable', 'boolean'],
        ]);

        $leaveType->update($data);
        return response()->json(['leave_type' => new LeaveTypeResource($leaveType)]);
    }

    public function destroy(Request $request, LeaveType $leaveType): JsonResponse
    {
        $this->checkAdmin($request);

        $leaveType->update(['is_active' => false]);
        return response()->json(['message' => 'Leave type deactivated']);
    }

    private function checkAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }
    }
}
