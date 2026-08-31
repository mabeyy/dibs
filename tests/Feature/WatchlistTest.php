<?php

use App\Models\Listing;
use App\Models\User;
use App\Models\Watchlist;

test('a user can add and remove a listing from their watchlist', function () {
    $user = User::factory()->create();
    $listing = Listing::factory()->create();

    $this->actingAs($user)->post(route('watchlist.toggle', $listing))->assertRedirect();
    expect(Watchlist::where(['user_id' => $user->id, 'listing_id' => $listing->id])->exists())->toBeTrue();

    $this->actingAs($user)->post(route('watchlist.toggle', $listing))->assertRedirect();
    expect(Watchlist::where(['user_id' => $user->id, 'listing_id' => $listing->id])->exists())->toBeFalse();
});

test('the watchlist page lists watched items', function () {
    $user = User::factory()->create();
    $watched = Listing::factory()->create();
    Listing::factory()->create(); // not watched
    $user->watchlists()->create(['listing_id' => $watched->id]);

    $this->actingAs($user)->get(route('watchlist.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('watchlist/index')->has('listings', 1));
});

test('guests are redirected to login when watching', function () {
    $listing = Listing::factory()->create();

    $this->post(route('watchlist.toggle', $listing))->assertRedirect(route('login'));
});

test('browse marks which listings the user is watching', function () {
    $user = User::factory()->create();
    $watched = Listing::factory()->create();
    $user->watchlists()->create(['listing_id' => $watched->id]);

    $this->actingAs($user)->get(route('browse'))
        ->assertInertia(fn ($page) => $page
            ->where('listings.data.0.is_watched', true));
});
