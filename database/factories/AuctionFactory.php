<?php

namespace Database\Factories;

use App\Models\Auction;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Auction>
 */
class AuctionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startingBid = fake()->numberBetween(1000, 20000);

        return [
            'listing_id' => Listing::factory()->auction(),
            'starting_bid_cents' => $startingBid,
            'reserve_price_cents' => null,
            'min_increment_cents' => 100,
            'current_bid_cents' => null,
            'high_bidder_id' => null,
            'winner_id' => null,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDays(3),
            'closed_at' => null,
        ];
    }

    public function endingSoon(): static
    {
        return $this->state(fn (array $attributes): array => [
            'ends_at' => now()->addMinute(),
        ]);
    }

    public function ended(): static
    {
        return $this->state(fn (array $attributes): array => [
            'starts_at' => now()->subDays(3),
            'ends_at' => now()->subMinute(),
        ]);
    }

    public function withReserve(int $reserveCents): static
    {
        return $this->state(fn (array $attributes): array => [
            'reserve_price_cents' => $reserveCents,
        ]);
    }
}
