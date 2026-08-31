<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("You won: {$this->listing->title}")
            ->line("Congratulations! You won the auction for \"{$this->listing->title}\".")
            ->action('View your order', route('orders.index'))
            ->line('The shop will be in touch to arrange delivery.');
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
