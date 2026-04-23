<?php

namespace App\Modules\Announcement\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Announcement\Jobs\NotifyEmployeesJob;
use App\Modules\Announcement\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::with('author:id,name,avatar')->latest()->paginate(20);
        return response()->json($announcements);
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $data['author_id'] = $request->user()->id;
        $announcement = Announcement::create($data);

        NotifyEmployeesJob::dispatch($announcement);

        return response()->json(['announcement' => $announcement->load('author:id,name')], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'title'   => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
        ]);

        $announcement->update($data);
        return response()->json(['announcement' => $announcement]);
    }

    public function destroy(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkAdmin($request);
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted']);
    }

    private function checkAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }
    }
}
