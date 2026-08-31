<?php

use App\Models\Auction;
use App\Models\Bid;
use App\Models\Listing;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\OutbidNotification;
use App\Services\BidService;
use Illuminate\Support\Facades\Notification;

/**
 * @return array{0: Auction, 1: User} the auction and its seller
 */
function liveAuction(int $startingBid = 1000, int $increment = 100): array
{
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $listing = Listing::factory()->auction()->for($shop)->create();
    $auction = Auction::factory()->for($listing)->create([
        'starting_bid_cents' => $startingBid,
        'min_increment_cents' => $increment,
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addDay(),
    ]);

    return [$auction, $seller];
}

test('a valid bid becomes the current high bid', function () {
    [$auction] = liveAuction();
    $bidder = User::factory()->create();

    $this->actingAs($bidder)
        ->post(route('bids.store', $auction->listing), ['amount' => 15])
        ->assertRedirect();

    $auction->refresh();
    expect($auction->current_bid_cents)->toBe(1500)
        ->and($auction->high_bidder_id)->toBe($bidder->id)
        ->and(Bid::count())->toBe(1);
});

test('a bid below the starting price is rejected', function () {
    [$auction] = liveAuction(startingBid: 2000);

    $this->actingAs(User::factory()->create())
        ->post(route('bids.store', $auction->listing), ['amount' => 15])
        ->assertSessionHasErrors('amount');

    expect($auction->refresh()->current_bid_cents)->toBeNull();
});

test('a follow-up bid must beat the current bid by the increment', function () {
    [$auction] = liveAuction(startingBid: 1000, increment: 100);
    $this->actingAs(User::factory()->create())->post(route('bids.store', $auction->listing), ['amount' => 10]);

    // Current bid is 1000, increment 100 -> next must be >= 1100. 10.50 = 1050 fails.
    $this->actingAs(User::factory()->create())
        ->post(route('bids.store', $auction->listing), ['amount' => 10.5])
        ->assertSessionHasErrors('amount');

    expect($auction->refresh()->current_bid_cents)->toBe(1000);
});

test('a seller cannot bid on their own auction', function () {
    [$auction, $seller] = liveAuction();

    $this->actingAs($seller)
        ->post(route('bids.store', $auction->listing), ['amount' => 50])
        ->assertSessionHasErrors('amount');
});

test('bidding on an ended auction is rejected', function () {
    [$auction] = liveAuction();
    $auction->update(['ends_at' => now()->subMinute()]);

    $this->actingAs(User::factory()->create())
        ->post(route('bids.store', $auction->listing), ['amount' => 50])
        ->assertSessionHasErrors('amount');
});

test('the previous high bidder is notified when outbid', function () {
    Notification::fake();
    [$auction] = liveAuction();
    $first = User::factory()->create();
    $second = User::factory()->create();

    app(BidService::class)->place($auction, $first, 1500);
    app(BidService::class)->place($auction, $second, 2000);

    Notification::assertSentTo($first, OutbidNotification::class);
    Notification::assertNotSentTo($second, OutbidNotification::class);
});

test('a bid in the final moments extends the auction (anti-snipe)', function () {
    [$auction] = liveAuction();
    $auction->update(['ends_at' => now()->addSeconds(30)]);
    $originalEnd = $auction->ends_at;

    app(BidService::class)->place($auction, User::factory()->create(), 1500);

    $auction->refresh();
    expect($auction->ends_at->greaterThan($originalEnd))->toBeTrue()
        ->and($auction->ends_at->greaterThan(now()->addSeconds(100)))->toBeTrue();
});

test('a bid comfortably before the end does not extend it', function () {
    [$auction] = liveAuction();
    $originalEnd = $auction->ends_at->copy();

    app(BidService::class)->place($auction, User::factory()->create(), 1500);

    expect($auction->refresh()->ends_at->equalTo($originalEnd))->toBeTrue();
});
