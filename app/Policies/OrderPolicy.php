<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * The buyer or the selling shop's owner may view an order.
     */
    public function view(User $user, Order $order): bool
    {
        return $this->isBuyer($user, $order) || $this->isSeller($user, $order);
    }

    /**
     * Only the seller may mark a pending order as shipped.
     */
    public function ship(User $user, Order $order): bool
    {
        return $this->isSeller($user, $order) && $order->status === OrderStatus::Pending;
    }

    /**
     * Only the buyer may confirm receipt of a shipped order.
     */
    public function receive(User $user, Order $order): bool
    {
        return $this->isBuyer($user, $order) && $order->status === OrderStatus::Shipped;
    }

    /**
     * The buyer may set/update the shipping address until the item ships.
     */
    public function updateShippingAddress(User $user, Order $order): bool
    {
        return $this->isBuyer($user, $order)
            && $order->status === OrderStatus::Pending
            && $order->shipped_at === null;
    }

    /**
     * Either party may cancel while the order is still pending.
     */
    public function cancel(User $user, Order $order): bool
    {
        return ($this->isBuyer($user, $order) || $this->isSeller($user, $order))
            && $order->status === OrderStatus::Pending;
    }

    private function isBuyer(User $user, Order $order): bool
    {
        return $user->id === $order->buyer_id;
    }

    private function isSeller(User $user, Order $order): bool
    {
        return $user->id === $order->shop->owner_id;
    }
}
