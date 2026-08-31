<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $shop = Shop::factory()->verified();

        return [
            'listing_id' => Listing::factory()->for($shop),
            'buyer_id' => User::factory(),
            'shop_id' => $shop,
            'amount_cents' => fake()->numberBetween(1000, 50000),
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'shipped_at' => null,
            'received_at' => null,
            'cancelled_at' => null,
        ];
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => OrderStatus::Completed,
            'shipped_at' => now()->subDays(3),
            'received_at' => now(),
        ]);
    }
}
