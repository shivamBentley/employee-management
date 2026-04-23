<?php

namespace App\Modules\Setting\Middleware;

use App\Modules\Setting\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeatureEnabled
{
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        $enabled = Setting::get($featureKey, '1');

        if ($enabled === '0' || $enabled === false) {
            return response()->json([
                'message' => "Feature '{$featureKey}' is currently disabled.",
            ], 403);
        }

        return $next($request);
    }
}
