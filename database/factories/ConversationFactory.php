<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'buyer_id' => User::factory(),
            'shop_id' => Shop::factory()->verified(),
            'listing_id' => null,
            'last_message_at' => now(),
        ];
    }
}
