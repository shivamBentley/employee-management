<?php

namespace App\Modules\Announcement\Jobs;

use App\Modules\Announcement\Models\Announcement;
use App\Modules\Notification\Models\Notification;
use App\Modules\User\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class NotifyEmployeesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Announcement $announcement) {}

    public function handle(): void
    {
        $employees = User::where('is_active', true)->pluck('id');

        $notifications = $employees->map(fn($userId) => [
            'user_id'    => $userId,
            'type'       => 'announcement',
            'title'      => $this->announcement->title,
            'body'       => substr(strip_tags($this->announcement->content), 0, 200),
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        // Bulk insert in chunks to avoid memory issues
        collect($notifications)->chunk(500)->each(fn($chunk) =>
            Notification::insert($chunk->toArray())
        );
    }
}
