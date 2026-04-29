<?php

namespace App\Modules\User\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\LeaveBalance\Services\LeaveBalanceService;
use App\Modules\LeaveGroup\Models\LeaveGroup;
use App\Modules\User\Models\User;
use App\Modules\User\Resources\UserResource;
use App\Modules\User\Requests\StoreUserRequest;
use App\Modules\User\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\LeaveBalance\Models\UserLeaveBalance;
use App\Modules\LeaveBalance\Resources\UserLeaveBalanceResource;
use App\Modules\Leave\Models\Leave;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with(['department', 'presence', 'leaveGroup'])->get();
        return response()->json(['users' => UserResource::collection($users)]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => new UserResource($user->load('department', 'presence', 'leaveGroup'))]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Assign default leave group if not specified
        if (empty($data['leave_group_id'])) {
            $defaultGroup = LeaveGroup::where('is_default', true)->first();
            if ($defaultGroup) {
                $data['leave_group_id'] = $defaultGroup->id;
            }
        }

        $user = User::create($data);

        // Provision leave balances from assigned leave group
        app(LeaveBalanceService::class)->provisionForUser($user);

        return response()->json(['user' => new UserResource($user)], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json(['user' => new UserResource($user->fresh()->load('department', 'presence', 'leaveGroup'))]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(['message' => 'Employee deleted']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('department', 'presence', 'leaveGroup')),
        ]);
    }

    public function updateMe(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);
        return response()->json(['user' => new UserResource($user->fresh()->load('department', 'presence', 'leaveGroup'))]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Get leave statistics for a given user (admin) or self.
     */
    public function leaveStats(Request $request, ?User $user = null): JsonResponse
    {
        $targetUser = $user ?? $request->user();

        // Non-admin can only view own stats
        if (! $request->user()->isAdmin() && $targetUser->id !== $request->user()->id) {
            abort(403, 'Forbidden');
        }

        $year = (int) $request->input('year', now()->year);

        // Leave balances for this year
        $balances = UserLeaveBalance::with('leaveType')
            ->where('user_id', $targetUser->id)
            ->where('year', $year)
            ->get();

        // Leave request counts by status
        $leaveQuery = Leave::where('user_id', $targetUser->id)
            ->whereYear('start_date', $year);

        $statusCounts = (clone $leaveQuery)->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalAllocated = $balances->sum('allocated');
        $totalUsed      = $balances->sum('used');
        $totalAvailable  = $balances->sum(fn($b) => $b->available);

        return response()->json([
            'year'            => $year,
            'balances'        => UserLeaveBalanceResource::collection($balances),
            'total_allocated' => round((float) $totalAllocated, 1),
            'total_used'      => round((float) $totalUsed, 1),
            'total_available' => round((float) $totalAvailable, 1),
            'total_requests'  => (int) $statusCounts->sum(),
            'approved_count'  => (int) ($statusCounts['approved'] ?? 0),
            'pending_count'   => (int) ($statusCounts['pending'] ?? 0),
            'rejected_count'  => (int) ($statusCounts['rejected'] ?? 0),
        ]);
    }
}
