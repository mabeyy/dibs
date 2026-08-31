<?php

namespace App\Services;

use App\Enums\ListingStatus;
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
     * @throws RuntimeException when the listing is no longer available.
     */
    public function place(Listing $listing, User $buyer, int $amountCents): Order
    {
        return DB::transaction(function () use ($listing, $buyer, $amountCents): Order {
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
            ]);

            $locked->update([
                'status' => ListingStatus::Sold,
                'sold_order_id' => $order->id,
            ]);

            return $order;
        });
    }
}
