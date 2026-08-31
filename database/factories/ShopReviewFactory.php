<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Shop;
use App\Models\ShopReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShopReview>
 */
class ShopReviewFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shop_id' => Shop::factory()->verified(),
            'buyer_id' => User::factory(),
            'order_id' => Order::factory()->completed(),
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->sentence(10),
        ];
    }
}
