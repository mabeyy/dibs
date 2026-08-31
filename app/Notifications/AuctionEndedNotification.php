<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->subject("Your auction ended: {$this->listing->title}");

        return $this->sold
            ? $mail->line("Your auction \"{$this->listing->title}\" sold.")
                ->action('View your sales', route('orders.index'))
            : $mail->line("Your auction \"{$this->listing->title}\" ended without a winning bid.")
                ->action('View listing', route('listings.show', $this->listing));
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
