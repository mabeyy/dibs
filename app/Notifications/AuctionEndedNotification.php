<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionEndedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Listing $listing,
        public bool $sold,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'auction_ended',
            'listing_id' => $this->listing->id,
            'title' => $this->listing->title,
            'message' => $this->sold
                ? "Your auction \"{$this->listing->title}\" sold."
                : "Your auction \"{$this->listing->title}\" ended without a winning bid.",
        ];
    }
}
