<?php

use App\Enums\Category;
use App\Enums\ListingStatus;
use App\Models\Listing;

test('browse only shows active listings', function () {
    Listing::factory()->create(['status' => ListingStatus::Active, 'title' => 'Live item']);
    Listing::factory()->create(['status' => ListingStatus::Draft, 'title' => 'Hidden draft']);
    Listing::factory()->create(['status' => ListingStatus::Sold, 'title' => 'Gone item']);

    $this->get(route('browse'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('browse')
            ->has('listings.data', 1)
            ->where('listings.data.0.title', 'Live item'));
});

test('browse can filter by category', function () {
    Listing::factory()->ofCategory(Category::Watches)->create();
    Listing::factory()->ofCategory(Category::Bags)->create();

    $this->get(route('browse', ['category' => Category::Watches->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('listings.data', 1)
            ->where('listings.data.0.category', 'watches'));
});

test('browse can search by title', function () {
    Listing::factory()->create(['title' => 'Cashmere sweater']);
    Listing::factory()->create(['title' => 'Denim jeans']);

    $this->get(route('browse', ['q' => 'cashmere']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('listings.data', 1));
});

test('an invalid category filter is rejected', function () {
    $this->get(route('browse', ['category' => 'electronics']))
        ->assertSessionHasErrors('category');
});

test('a listing detail page loads', function () {
    $listing = Listing::factory()->create();

    $this->get(route('listings.show', $listing))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('listings/show')
            ->where('listing.id', $listing->id));
});

test('a draft listing detail returns 404', function () {
    $listing = Listing::factory()->draft()->create();

    $this->get(route('listings.show', $listing))->assertNotFound();
});
