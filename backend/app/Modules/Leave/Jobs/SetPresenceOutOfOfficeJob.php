<?php

namespace App\Modules\Leave\Jobs;

use App\Modules\Leave\Models\Leave;
use App\Modules\Presence\Models\Presence;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SetPresenceOutOfOfficeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Leave $leave) {}

    public function handle(): void
    {
        Presence::updateOrCreate(
            ['user_id' => $this->leave->user_id],
            ['status' => 'out_of_office', 'last_seen' => now()]
        );
    }
}
