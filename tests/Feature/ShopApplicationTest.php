<?php

use App\Enums\ShopStatus;
use App\Models\Shop;
use App\Models\User;

test('a user can apply to open a shop and it starts pending', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('seller.apply.store'), [
            'name' => 'Thrift Threads',
            'bio' => 'Curated second-hand denim.',
        ])
        ->assertRedirect(route('seller.apply'));

    $shop = Shop::sole();
    expect($shop->owner_id)->toBe($user->id)
        ->and($shop->status)->toBe(ShopStatus::Pending)
        ->and($shop->slug)->toBe('thrift-threads');
});

test('a user cannot open a second shop', function () {
    $user = User::factory()->create();
    Shop::factory()->for($user, 'owner')->create();

    $this->actingAs($user)
        ->post(route('seller.apply.store'), ['name' => 'Another Shop'])
        ->assertForbidden();

    expect(Shop::where('owner_id', $user->id)->count())->toBe(1);
});

test('shop name is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('seller.apply.store'), ['name' => ''])
        ->assertSessionHasErrors('name');
});

test('slug is made unique when shop names collide', function () {
    Shop::factory()->create(['slug' => 'thrift-threads']);
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('seller.apply.store'), ['name' => 'Thrift Threads']);

    expect(Shop::where('owner_id', $user->id)->value('slug'))->toBe('thrift-threads-2');
});

test('guests cannot apply', function () {
    $this->post(route('seller.apply.store'), ['name' => 'Nope'])
        ->assertRedirect(route('login'));
});
