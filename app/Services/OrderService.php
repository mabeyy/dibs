<?php

namespace App\Services;

use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderService
{
    /**
     * Create an order for a unique listing and mark it sold.
     *
     * Used by both the buy-now flow and auction settlement. Runs inside a
     * transaction with a row lock so a single item can never be sold twice.
     *
     * Payment is intentionally left Unpaid — on-platform escrow arrives in a
     * later phase; for now buyer and shop settle off-platform.
     *
     * @param  array<string, string|null>  $shipping  Optional shipping address
     *                                                (buy-now supplies it; auction
     *                                                winners add it afterwards).
     *
     * @throws RuntimeException when the listing is no longer available.
     */
    public function place(Listing $listing, User $buyer, int $amountCents, array $shipping = []): Order
    {
        return DB::transaction(function () use ($listing, $buyer, $amountCents, $shipping): Order {
            /** @var Listing $locked */
            $locked = Listing::whereKey($listing->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== ListingStatus::Active) {
                throw new RuntimeException('This item is no longer available.');
            }

            $order = Order::create([
                'listing_id' => $locked->id,
                'buyer_id' => $buyer->id,
                'shop_id' => $locked->shop_id,
                'amount_cents' => $amountCents,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                ...$shipping,
            ]);

            $locked->update([
                'status' => ListingStatus::Sold,
                'sold_order_id' => $order->id,
            ]);

            return $order;
        });
    }

    /**
     * Cancel a still-pending order and free the item.
     *
     * A fixed-price listing returns to sale (Active); an auction listing cannot
     * be re-run, so it is marked Ended. Idempotent-safe via a row lock.
     *
     * @throws RuntimeException when the order can no longer be cancelled.
     */
    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order): Order {
            /** @var Order $locked */
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== OrderStatus::Pending) {
                throw new RuntimeException('Only a pending order can be cancelled.');
            }

            $locked->update([
                'status' => OrderStatus::Cancelled,
                'payment_status' => PaymentStatus::Refunded,
                'cancelled_at' => now(),
            ]);

            /** @var Listing $listing */
            $listing = Listing::whereKey($locked->listing_id)->lockForUpdate()->firstOrFail();

            $listing->update([
                'status' => $listing->type === ListingType::Fixed
                    ? ListingStatus::Active
                    : ListingStatus::Ended,
                'sold_order_id' => null,
            ]);

            return $locked->refresh();
        });
    }
}
