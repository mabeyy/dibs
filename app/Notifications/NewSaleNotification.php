<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSaleNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

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
            ->subject("You sold: {$this->order->listing->title}")
            ->line("You sold \"{$this->order->listing->title}\".")
            ->action('View the order', route('orders.index'))
            ->line('Arrange shipping with the buyer and mark it shipped when it is on its way.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_sale',
            'order_id' => $this->order->id,
            'listing_id' => $this->order->listing_id,
            'title' => $this->order->listing->title,
            'message' => "You sold \"{$this->order->listing->title}\". Arrange shipping with the buyer.",
        ];
    }
}
