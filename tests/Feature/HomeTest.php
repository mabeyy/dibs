<?php

use App\Models\Auction;
use App\Models\Listing;

test('the home page renders ending-soon auctions and fresh listings', function () {
    Listing::factory()->count(3)->create();
    $auctionListing = Listing::factory()->auction()->create();
    Auction::factory()->for($auctionListing)->create(['ends_at' => now()->addHours(2)]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('home')
            ->has('fresh')
            ->has('endingSoon', 1));
});
