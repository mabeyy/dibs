<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class ShopReviewPolicy
{
    /**
     * A buyer may review a shop once per completed order.
     */
    public function createForOrder(User $user, Order $order): bool
    {
        return $user->id === $order->buyer_id
            && $order->isCompleted()
            && $order->review()->doesntExist();
    }
}
