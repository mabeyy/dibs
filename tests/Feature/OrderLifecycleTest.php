<?php

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;

function fixedListing(?Shop $shop = null): Listing
{
    $shop ??= Shop::factory()->verified()->create();

    return Listing::factory()->for($shop)->create([
        'status' => ListingStatus::Active,
        'price_cents' => 5000,
    ]);
}

test('a buyer can buy a fixed listing which becomes sold', function () {
    $buyer = User::factory()->create();
    $listing = fixedListing();

    $this->actingAs($buyer)
        ->post(route('orders.store', $listing))
        ->assertRedirect(route('orders.index'));

    $order = Order::sole();
    expect($order->buyer_id)->toBe($buyer->id)
        ->and($order->amount_cents)->toBe(5000)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->payment_status)->toBe(PaymentStatus::Unpaid)
        ->and($listing->refresh()->status)->toBe(ListingStatus::Sold)
        ->and($listing->sold_order_id)->toBe($order->id);
});

test('the same item cannot be bought twice', function () {
    $listing = fixedListing();

    $this->actingAs(User::factory()->create())->post(route('orders.store', $listing))->assertRedirect();
    $this->actingAs(User::factory()->create())->post(route('orders.store', $listing))->assertSessionHasErrors('listing');

    expect(Order::count())->toBe(1);
});

test('a seller cannot buy their own listing', function () {
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $listing = fixedListing($shop);

    $this->actingAs($seller)->post(route('orders.store', $listing))->assertSessionHasErrors('listing');
    expect(Order::count())->toBe(0);
});

test('an auction listing cannot be bought now', function () {
    $listing = Listing::factory()->auction()->create(['status' => ListingStatus::Active]);

    $this->actingAs(User::factory()->create())
        ->post(route('orders.store', $listing))
        ->assertSessionHasErrors('listing');
});

test('the seller ships and the buyer confirms receipt', function () {
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $buyer = User::factory()->create();
    $order = Order::factory()
        ->for($shop)
        ->for(fixedListing($shop))
        ->create(['buyer_id' => $buyer->id, 'status' => OrderStatus::Pending]);

    $this->actingAs($seller)->patch(route('orders.ship', $order))->assertRedirect();
    expect($order->refresh()->status)->toBe(OrderStatus::Shipped)
        ->and($order->shipped_at)->not->toBeNull();

    $this->actingAs($buyer)->patch(route('orders.receive', $order))->assertRedirect();
    expect($order->refresh()->status)->toBe(OrderStatus::Completed)
        ->and($order->received_at)->not->toBeNull();
});

test('a buyer cannot mark their own order as shipped', function () {
    $buyer = User::factory()->create();
    $order = Order::factory()->create(['buyer_id' => $buyer->id, 'status' => OrderStatus::Pending]);

    $this->actingAs($buyer)->patch(route('orders.ship', $order))->assertForbidden();
});

test('receipt cannot be confirmed before shipping', function () {
    $buyer = User::factory()->create();
    $order = Order::factory()->create(['buyer_id' => $buyer->id, 'status' => OrderStatus::Pending]);

    $this->actingAs($buyer)->patch(route('orders.receive', $order))->assertForbidden();
});
