<?php

use App\Models\Order;
use App\Models\Shop;
use App\Models\ShopReview;
use App\Models\User;

test('a buyer can review a shop after completing an order', function () {
    $shop = Shop::factory()->verified()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->completed()->for($shop)->create(['buyer_id' => $buyer->id]);

    $this->actingAs($buyer)
        ->post(route('orders.review', $order), ['rating' => 5, 'body' => 'Great seller!'])
        ->assertRedirect();

    $review = ShopReview::sole();
    expect($review->shop_id)->toBe($shop->id)
        ->and($review->rating)->toBe(5);

    $shop->refresh();
    expect($shop->ratings_count)->toBe(1)
        ->and((float) $shop->rating_avg)->toBe(5.0);
});

test('the cached rating averages multiple reviews', function () {
    $shop = Shop::factory()->verified()->create();

    foreach ([5, 4] as $rating) {
        $buyer = User::factory()->create();
        $order = Order::factory()->completed()->for($shop)->create(['buyer_id' => $buyer->id]);
        $this->actingAs($buyer)->post(route('orders.review', $order), ['rating' => $rating]);
    }

    $shop->refresh();
    expect($shop->ratings_count)->toBe(2)
        ->and((float) $shop->rating_avg)->toBe(4.5);
});

test('a shop cannot be reviewed before the order is completed', function () {
    $shop = Shop::factory()->verified()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->shipped()->for($shop)->create(['buyer_id' => $buyer->id]);

    $this->actingAs($buyer)
        ->post(route('orders.review', $order), ['rating' => 5])
        ->assertForbidden();

    expect(ShopReview::count())->toBe(0);
});

test('an order can only be reviewed once', function () {
    $shop = Shop::factory()->verified()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->completed()->for($shop)->create(['buyer_id' => $buyer->id]);

    $this->actingAs($buyer)->post(route('orders.review', $order), ['rating' => 5])->assertRedirect();
    $this->actingAs($buyer)->post(route('orders.review', $order), ['rating' => 1])->assertForbidden();

    expect(ShopReview::count())->toBe(1);
});

test('a non-buyer cannot review the shop', function () {
    $shop = Shop::factory()->verified()->create();
    $order = Order::factory()->completed()->for($shop)->create();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)->post(route('orders.review', $order), ['rating' => 5])->assertForbidden();
});

test('rating must be between 1 and 5', function () {
    $shop = Shop::factory()->verified()->create();
    $buyer = User::factory()->create();
    $order = Order::factory()->completed()->for($shop)->create(['buyer_id' => $buyer->id]);

    $this->actingAs($buyer)->post(route('orders.review', $order), ['rating' => 6])->assertSessionHasErrors('rating');
});

test('the public shop page loads with reviews', function () {
    $shop = Shop::factory()->verified()->create();
    ShopReview::factory()->for($shop)->create(['rating' => 5]);

    $this->get(route('shops.show', $shop))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('shops/show')
            ->where('shop.id', $shop->id)
            ->has('reviews', 1));
});
