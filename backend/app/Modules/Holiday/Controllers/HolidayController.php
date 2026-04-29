<?php

namespace App\Modules\Holiday\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Holiday\Models\Holiday;
use App\Modules\Holiday\Resources\HolidayResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Holiday::where('is_active', true)->orderBy('date');

        if (! $request->user()->isAdmin()) {
            $query->forCountry($request->user()->country_code ?? '');
        } elseif ($request->has('country')) {
            $query->forCountry($request->input('country'));
        }

        if ($request->has('year')) {
            $query->forYear((int) $request->input('year'));
        }

        return response()->json(['holidays' => HolidayResource::collection($query->get())]);
    }

    public function countries(): JsonResponse
    {
        $countries = Holiday::select('country_code', 'country_name')
            ->distinct()
            ->orderBy('country_name')
            ->get();

        return response()->json(['countries' => $countries]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'country_code' => ['required', 'string', 'size:2'],
            'country_name' => ['required', 'string', 'max:255'],
            'name'         => ['required', 'string', 'max:255'],
            'date'         => ['required', 'date'],
            'description'  => ['nullable', 'string'],
        ]);

        $holiday = Holiday::create($data);
        return response()->json(['holiday' => new HolidayResource($holiday)], 201);
    }

    public function update(Request $request, Holiday $holiday): JsonResponse
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'country_code' => ['sometimes', 'string', 'size:2'],
            'country_name' => ['sometimes', 'string', 'max:255'],
            'name'         => ['sometimes', 'string', 'max:255'],
            'date'         => ['sometimes', 'date'],
            'description'  => ['nullable', 'string'],
            'is_active'    => ['nullable', 'boolean'],
        ]);

        $holiday->update($data);
        return response()->json(['holiday' => new HolidayResource($holiday)]);
    }

    public function destroy(Request $request, Holiday $holiday): JsonResponse
    {
        $this->checkAdmin($request);

        $holiday->delete();
        return response()->json(['message' => 'Holiday deleted']);
    }

    private function checkAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Admin only');
        }
    }
}
