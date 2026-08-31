<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionWonNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Listing $listing,
        public int $amountCents,
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
            'type' => 'auction_won',
            'listing_id' => $this->listing->id,
            'title' => $this->listing->title,
            'message' => "You won \"{$this->listing->title}\"! Arrange payment with the shop.",
            'amount_cents' => $this->amountCents,
        ];
    }
}
