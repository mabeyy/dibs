<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShippedNotification extends Notification
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
        $mail = (new MailMessage)
            ->subject("Your order shipped: {$this->order->listing->title}")
            ->line("\"{$this->order->listing->title}\" is on its way.");

        if ($this->order->tracking_number) {
            $mail->line("Carrier: {$this->order->shipping_carrier}")
                ->line("Tracking: {$this->order->tracking_number}");
        }

        return $mail->action('View your order', route('orders.index'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $tracking = $this->order->tracking_number
            ? " Tracking: {$this->order->shipping_carrier} {$this->order->tracking_number}."
            : '';

        return [
            'type' => 'order_shipped',
            'order_id' => $this->order->id,
            'listing_id' => $this->order->listing_id,
            'title' => $this->order->listing->title,
            'message' => "\"{$this->order->listing->title}\" has shipped.{$tracking}",
        ];
    }
}
