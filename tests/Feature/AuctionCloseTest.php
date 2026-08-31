<?php

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Models\Auction;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\AuctionEndedNotification;
use App\Notifications\AuctionWonNotification;
use App\Services\AuctionService;
use Illuminate\Support\Facades\Notification;

/**
 * Build an already-expired auction with an optional high bid.
 */
function expiredAuction(?int $currentBid = null, ?int $reserve = null, ?User $highBidder = null): Auction
{
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $listing = Listing::factory()->auction()->for($shop)->create(['status' => ListingStatus::Active]);

    return Auction::factory()->for($listing)->create([
        'starting_bid_cents' => 1000,
        'reserve_price_cents' => $reserve,
        'current_bid_cents' => $currentBid,
        'high_bidder_id' => $highBidder?->id,
        'starts_at' => now()->subDays(3),
        'ends_at' => now()->subMinute(),
    ]);
}

test('an expired auction with a qualifying bid awards the winner and creates an order', function () {
    Notification::fake();
    $winner = User::factory()->create();
    $auction = expiredAuction(currentBid: 5000, highBidder: $winner);

    $closed = app(AuctionService::class)->closeExpired();

    expect($closed)->toBe(1);

    $auction->refresh();
    expect($auction->closed_at)->not->toBeNull()
        ->and($auction->winner_id)->toBe($winner->id)
        ->and($auction->listing->refresh()->status)->toBe(ListingStatus::Sold);

    $order = Order::sole();
    expect($order->buyer_id)->toBe($winner->id)
        ->and($order->amount_cents)->toBe(5000)
        ->and($order->status)->toBe(OrderStatus::Pending);

    Notification::assertSentTo($winner, AuctionWonNotification::class);
});

test('an expired auction with no bids ends without an order', function () {
    Notification::fake();
    $auction = expiredAuction();

    app(AuctionService::class)->closeExpired();

    $auction->refresh();
    expect($auction->closed_at)->not->toBeNull()
        ->and($auction->winner_id)->toBeNull()
        ->and($auction->listing->refresh()->status)->toBe(ListingStatus::Ended)
        ->and(Order::count())->toBe(0);

    Notification::assertSentTo($auction->listing->shop->owner, AuctionEndedNotification::class);
});

test('an expired auction below reserve ends without a sale', function () {
    $winner = User::factory()->create();
    $auction = expiredAuction(currentBid: 3000, reserve: 5000, highBidder: $winner);

    app(AuctionService::class)->closeExpired();

    expect($auction->refresh()->winner_id)->toBeNull()
        ->and($auction->listing->refresh()->status)->toBe(ListingStatus::Ended)
        ->and(Order::count())->toBe(0);
});

test('closing is idempotent and skips already-closed auctions', function () {
    $winner = User::factory()->create();
    $auction = expiredAuction(currentBid: 5000, highBidder: $winner);

    app(AuctionService::class)->closeExpired();
    app(AuctionService::class)->closeExpired();

    expect(Order::count())->toBe(1);
});

test('a future auction is not closed', function () {
    $winner = User::factory()->create();
    $auction = expiredAuction(currentBid: 5000, highBidder: $winner);
    $auction->update(['ends_at' => now()->addDay()]);

    $closed = app(AuctionService::class)->closeExpired();

    expect($closed)->toBe(0)
        ->and($auction->refresh()->closed_at)->toBeNull();
});

test('the console command settles due auctions', function () {
    $winner = User::factory()->create();
    expiredAuction(currentBid: 5000, highBidder: $winner);

    $this->artisan('auctions:close-expired')->assertSuccessful();

    expect(Order::count())->toBe(1);
});
