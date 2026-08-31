<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCancelledNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order,
        public bool $cancelledBySeller,
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
        $who = $this->cancelledBySeller ? 'The seller' : 'The buyer';

        return (new MailMessage)
            ->subject("Order cancelled: {$this->order->listing->title}")
            ->line("{$who} cancelled the order for \"{$this->order->listing->title}\".")
            ->action('View your orders', route('orders.index'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_cancelled',
            'order_id' => $this->order->id,
            'listing_id' => $this->order->listing_id,
            'title' => $this->order->listing->title,
            'message' => $this->cancelledBySeller
                ? "The seller cancelled your order for \"{$this->order->listing->title}\"."
                : "The buyer cancelled their order for \"{$this->order->listing->title}\".",
        ];
    }
}
