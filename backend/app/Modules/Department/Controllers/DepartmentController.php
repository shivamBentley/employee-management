<?php

namespace App\Modules\Department\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Department\Models\Department;
use App\Modules\Department\Resources\DepartmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::withCount('users')->get();
        return response()->json(['departments' => DepartmentResource::collection($departments)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'unique:departments', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $department = Department::create($data);
        return response()->json(['department' => new DepartmentResource($department)], 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'unique:departments,name,' . $department->id, 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $department->update($data);
        return response()->json(['department' => new DepartmentResource($department)]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(['message' => 'Department deleted']);
    }
}
