<?php

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\NewSaleNotification;
use Illuminate\Support\Facades\Notification;

function fixedListing(?Shop $shop = null): Listing
{
    $shop ??= Shop::factory()->verified()->create();

    return Listing::factory()->for($shop)->create([
        'status' => ListingStatus::Active,
        'price_cents' => 5000,
    ]);
}

/**
 * @return array<string, string>
 */
function shipTo(): array
{
    return [
        'ship_name' => 'Jane Doe',
        'ship_line1' => '123 Main St',
        'ship_city' => 'Portland',
        'ship_postal_code' => '97201',
        'ship_country' => 'US',
    ];
}

test('a buyer can buy a fixed listing which becomes sold', function () {
    $buyer = User::factory()->create();
    $listing = fixedListing();

    $this->actingAs($buyer)
        ->post(route('orders.store', $listing), shipTo())
        ->assertRedirect(route('orders.index'));

    $order = Order::sole();
    expect($order->buyer_id)->toBe($buyer->id)
        ->and($order->amount_cents)->toBe(5000)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->payment_status)->toBe(PaymentStatus::Unpaid)
        ->and($order->ship_line1)->toBe('123 Main St')
        ->and($listing->refresh()->status)->toBe(ListingStatus::Sold)
        ->and($listing->sold_order_id)->toBe($order->id);
});

test('buying notifies the seller of the sale', function () {
    Notification::fake();

    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $listing = fixedListing($shop);

    $this->actingAs(User::factory()->create())
        ->post(route('orders.store', $listing), shipTo())
        ->assertRedirect();

    Notification::assertSentTo($seller, NewSaleNotification::class);
});

test('buying requires a shipping address', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('orders.store', fixedListing()))
        ->assertSessionHasErrors(['ship_name', 'ship_line1', 'ship_city', 'ship_postal_code', 'ship_country']);

    expect(Order::count())->toBe(0);
});

test('the same item cannot be bought twice', function () {
    $listing = fixedListing();

    $this->actingAs(User::factory()->create())->post(route('orders.store', $listing), shipTo())->assertRedirect();
    // Second attempt is rejected because the unique item is already sold.
    $this->actingAs(User::factory()->create())->post(route('orders.store', $listing), shipTo())->assertSessionHasErrors('listing');

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

    $this->actingAs($seller)->patch(route('orders.ship', $order), [
        'shipping_carrier' => 'USPS',
        'tracking_number' => '9400111899223',
    ])->assertRedirect();
    expect($order->refresh()->status)->toBe(OrderStatus::Shipped)
        ->and($order->shipped_at)->not->toBeNull()
        ->and($order->tracking_number)->toBe('9400111899223');

    $this->actingAs($buyer)->patch(route('orders.receive', $order))->assertRedirect();
    expect($order->refresh()->status)->toBe(OrderStatus::Completed)
        ->and($order->received_at)->not->toBeNull();
});

test('shipping requires a carrier and tracking number', function () {
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $order = Order::factory()->for($shop)->for(fixedListing($shop))->create();

    $this->actingAs($seller)->patch(route('orders.ship', $order))
        ->assertSessionHasErrors(['shipping_carrier', 'tracking_number']);
});

test('a seller cannot ship until the buyer provides an address', function () {
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $buyer = User::factory()->create();
    $order = Order::factory()
        ->for($shop)
        ->for(fixedListing($shop))
        ->withoutAddress()
        ->create(['buyer_id' => $buyer->id]);

    $this->actingAs($seller)->patch(route('orders.ship', $order), [
        'shipping_carrier' => 'USPS',
        'tracking_number' => '9400111899223',
    ])->assertSessionHasErrors('order');

    // Buyer supplies the address, then the seller can ship.
    $this->actingAs($buyer)->patch(route('orders.address.update', $order), shipTo())->assertRedirect();
    expect($order->refresh()->hasShippingAddress())->toBeTrue();

    $this->actingAs($seller)->patch(route('orders.ship', $order), [
        'shipping_carrier' => 'USPS',
        'tracking_number' => '9400111899223',
    ])->assertRedirect();
    expect($order->refresh()->status)->toBe(OrderStatus::Shipped);
});

test('a buyer can cancel a pending order and the item relists', function () {
    $buyer = User::factory()->create();
    $listing = fixedListing();

    $this->actingAs($buyer)->post(route('orders.store', $listing), shipTo())->assertRedirect();
    $order = Order::sole();

    $this->actingAs($buyer)->patch(route('orders.cancel', $order))->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($order->cancelled_at)->not->toBeNull()
        ->and($listing->refresh()->status)->toBe(ListingStatus::Active)
        ->and($listing->sold_order_id)->toBeNull();
});

test('a seller can decline a pending order', function () {
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $order = Order::factory()->for($shop)->for(fixedListing($shop))->create();

    $this->actingAs($seller)->patch(route('orders.cancel', $order))->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled);
});

test('a shipped order cannot be cancelled', function () {
    $buyer = User::factory()->create();
    $order = Order::factory()->shipped()->create(['buyer_id' => $buyer->id]);

    $this->actingAs($buyer)->patch(route('orders.cancel', $order))->assertForbidden();
    expect($order->refresh()->status)->toBe(OrderStatus::Shipped);
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
