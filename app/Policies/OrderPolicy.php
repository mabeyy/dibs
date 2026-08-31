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

    private function isBuyer(User $user, Order $order): bool
    {
        return $user->id === $order->buyer_id;
    }

    private function isSeller(User $user, Order $order): bool
    {
        return $user->id === $order->shop->owner_id;
    }
}
