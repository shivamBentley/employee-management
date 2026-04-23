<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    protected array $modules = [
        'Auth',
        'User',
        'Department',
        'Leave',
        'Presence',
        'Announcement',
        'Notification',
        'Dashboard',
        'Setting',
        'Backup',
        'Demo',
    ];

    public function boot(): void
    {
        foreach ($this->modules as $module) {
            $routeFile = app_path("Modules/{$module}/routes.php");

            if (file_exists($routeFile)) {
                \Illuminate\Support\Facades\Route::prefix('api')
                    ->middleware('api')
                    ->group($routeFile);
            }
        }
    }

    public function register(): void
    {
        // Register UserPolicy
        $this->app['config']->set('auth.policies', array_merge(
            $this->app['config']->get('auth.policies', []),
            [
                \App\Modules\User\Models\User::class => \App\Modules\User\Policies\UserPolicy::class,
            ]
        ));
    }
}
