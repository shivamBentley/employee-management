<?php

namespace App\Modules\Presence\Events;

use App\Modules\Presence\Models\Presence;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PresenceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Presence $presence) {}

    public function broadcastOn(): array
    {
        return [new Channel('presence')];
    }

    public function broadcastAs(): string
    {
        return 'presence.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id'  => $this->presence->user_id,
            'status'   => $this->presence->status,
            'last_seen' => $this->presence->last_seen,
        ];
    }
}
