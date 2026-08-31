<?php

use App\Enums\ShopStatus;
use App\Models\Shop;
use App\Models\User;

test('an admin can verify a pending shop', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $shop = Shop::factory()->create(['status' => ShopStatus::Pending]);

    $this->actingAs($admin)
        ->patch(route('admin.shops.verify', $shop))
        ->assertRedirect();

    $shop->refresh();
    expect($shop->status)->toBe(ShopStatus::Verified)
        ->and($shop->verified_at)->not->toBeNull();
});

test('an admin can reject a shop with a reason', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $shop = Shop::factory()->create(['status' => ShopStatus::Pending]);

    $this->actingAs($admin)
        ->patch(route('admin.shops.reject', $shop), ['reason' => 'Selling prohibited items.'])
        ->assertRedirect();

    $shop->refresh();
    expect($shop->status)->toBe(ShopStatus::Rejected)
        ->and($shop->rejection_reason)->toBe('Selling prohibited items.');
});

test('rejecting requires a reason', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $shop = Shop::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.shops.reject', $shop), ['reason' => ''])
        ->assertSessionHasErrors('reason');
});

test('an admin can suspend a verified shop', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $shop = Shop::factory()->verified()->create();

    $this->actingAs($admin)->patch(route('admin.shops.suspend', $shop));

    expect($shop->refresh()->status)->toBe(ShopStatus::Suspended);
});

test('non-admins cannot access the moderation queue', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.shops.index'))->assertForbidden();
});

test('non-admins cannot verify shops', function () {
    $user = User::factory()->create();
    $shop = Shop::factory()->create();

    $this->actingAs($user)->patch(route('admin.shops.verify', $shop))->assertForbidden();
    expect($shop->refresh()->status)->toBe(ShopStatus::Pending);
});
