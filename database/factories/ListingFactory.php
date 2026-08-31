<?php

namespace Database\Factories;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Models\Listing;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shop_id' => Shop::factory()->verified(),
            'category' => fake()->randomElement(Category::cases()),
            'type' => ListingType::Fixed,
            'title' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'brand' => fake()->randomElement(['Zara', 'Uniqlo', 'Levi\'s', 'Gucci', 'Nike', null]),
            'size' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL', null]),
            'condition' => fake()->randomElement(ItemCondition::cases()),
            'price_cents' => fake()->numberBetween(1000, 50000),
            'status' => ListingStatus::Active,
            'sold_order_id' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ListingStatus::Draft,
        ]);
    }

    public function auction(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => ListingType::Auction,
            'price_cents' => null,
        ]);
    }

    public function ofCategory(Category $category): static
    {
        return $this->state(fn (array $attributes): array => [
            'category' => $category,
        ]);
    }
}
