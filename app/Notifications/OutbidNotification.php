<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OutbidNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Listing $listing,
        public int $newHighBidCents,
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
            ->subject("You've been outbid on {$this->listing->title}")
            ->line("Someone placed a higher bid on \"{$this->listing->title}\".")
            ->action('View auction', route('listings.show', $this->listing))
            ->line('Place another bid to stay in the running.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'outbid',
            'listing_id' => $this->listing->id,
            'title' => $this->listing->title,
            'message' => "You've been outbid on \"{$this->listing->title}\".",
            'amount_cents' => $this->newHighBidCents,
        ];
    }
}
