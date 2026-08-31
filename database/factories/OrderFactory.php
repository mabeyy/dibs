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
            'ship_name' => fake()->name(),
            'ship_line1' => fake()->streetAddress(),
            'ship_line2' => null,
            'ship_city' => fake()->city(),
            'ship_region' => fake()->stateAbbr(),
            'ship_postal_code' => fake()->postcode(),
            'ship_country' => 'US',
            'ship_phone' => fake()->phoneNumber(),
            'shipping_carrier' => null,
            'tracking_number' => null,
            'shipped_at' => null,
            'received_at' => null,
            'cancelled_at' => null,
        ];
    }

    /**
     * An order still awaiting the buyer's shipping address (e.g. a fresh auction win).
     */
    public function withoutAddress(): static
    {
        return $this->state(fn (array $attributes): array => [
            'ship_name' => null,
            'ship_line1' => null,
            'ship_line2' => null,
            'ship_city' => null,
            'ship_region' => null,
            'ship_postal_code' => null,
            'ship_country' => null,
            'ship_phone' => null,
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
            'shipping_carrier' => 'USPS',
            'tracking_number' => fake()->bothify('9####N######'),
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
