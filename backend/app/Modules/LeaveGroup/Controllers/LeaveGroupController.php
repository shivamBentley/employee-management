<?php

namespace App\Modules\LeaveGroup\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\LeaveGroup\Models\LeaveGroupItem;
use App\Modules\LeaveGroup\Resources\LeaveGroupResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaveGroupController extends Controller
{
    public function index(): JsonResponse
    {
        $groups = LeaveGroup::with('items.leaveType')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json(['leave_groups' => LeaveGroupResource::collection($groups)]);
    }

    public function show(LeaveGroup $leaveGroup): JsonResponse
    {
        $leaveGroup->load('items.leaveType')->loadCount('users');
        return response()->json(['leave_group' => new LeaveGroupResource($leaveGroup)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'name'                    => ['required', 'string', 'unique:leave_groups', 'max:255'],
            'description'             => ['nullable', 'string'],
            'is_default'              => ['nullable', 'boolean'],
            'items'                   => ['required', 'array', 'min:1'],
            'items.*.leave_type_id'   => ['required', 'exists:leave_types,id'],
            'items.*.balance'         => ['required', 'numeric', 'min:0'],
        ]);

        $group = DB::transaction(function () use ($data) {
            if (! empty($data['is_default'])) {
                LeaveGroup::where('is_default', true)->update(['is_default' => false]);
            }

            $group = LeaveGroup::create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'is_default'  => $data['is_default'] ?? false,
            ]);

            foreach ($data['items'] as $item) {
                $group->items()->create($item);
            }

            return $group;
        });

        $group->load('items.leaveType')->loadCount('users');
        return response()->json(['leave_group' => new LeaveGroupResource($group)], 201);
    }

    public function update(Request $request, LeaveGroup $leaveGroup): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'name'                    => ['sometimes', 'string', 'unique:leave_groups,name,' . $leaveGroup->id, 'max:255'],
            'description'             => ['nullable', 'string'],
            'is_default'              => ['nullable', 'boolean'],
            'items'                   => ['sometimes', 'array', 'min:1'],
            'items.*.leave_type_id'   => ['required_with:items', 'exists:leave_types,id'],
            'items.*.balance'         => ['required_with:items', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($leaveGroup, $data) {
            if (! empty($data['is_default'])) {
                LeaveGroup::where('is_default', true)
                    ->where('id', '!=', $leaveGroup->id)
                    ->update(['is_default' => false]);
            }

            $leaveGroup->update(collect($data)->except('items')->toArray());

            if (isset($data['items'])) {
                $leaveGroup->items()->delete();
                foreach ($data['items'] as $item) {
                    $leaveGroup->items()->create($item);
                }
            }
        });

        $leaveGroup->load('items.leaveType')->loadCount('users');
        return response()->json(['leave_group' => new LeaveGroupResource($leaveGroup)]);
    }

    public function destroy(Request $request, LeaveGroup $leaveGroup): JsonResponse
    {
        $this->checkAdmin($request);

        if ($leaveGroup->is_default) {
            return response()->json(['message' => 'Cannot delete the default leave group'], 422);
        }

        $userCount = $leaveGroup->users()->count();
        if ($userCount > 0) {
            return response()->json(['message' => "Cannot delete: {$userCount} users are assigned to this group"], 422);
        }

        $leaveGroup->delete();
        return response()->json(['message' => 'Leave group deleted']);
    }

    private function checkAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }
    }
}
