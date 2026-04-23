<?php

namespace App\Modules\Presence\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Presence\Events\PresenceUpdated;
use App\Modules\Presence\Models\Presence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function index(): JsonResponse
    {
        $presence = Presence::with('user')->get();
        return response()->json(['presence' => $presence]);
    }

    public function updateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:online,offline,away,out_of_office'],
        ]);

        $presence = Presence::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['status' => $request->status, 'last_seen' => now()]
        );

        broadcast(new PresenceUpdated($presence))->toOthers();

        return response()->json(['presence' => $presence]);
    }
}
