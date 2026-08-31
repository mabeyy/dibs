<?php

use App\Enums\Category;
use App\Enums\ListingStatus;
use App\Enums\Subcategory;
use App\Models\Listing;
use App\Models\Shop;

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

test('browse can filter by subcategory', function () {
    Listing::factory()
        ->ofCategory(Category::Shoes)
        ->ofSubcategory(Subcategory::Sneakers)
        ->create(['title' => 'Retro sneakers']);
    Listing::factory()
        ->ofCategory(Category::Shoes)
        ->ofSubcategory(Subcategory::Boots)
        ->create(['title' => 'Leather boots']);

    $this->get(route('browse', [
        'category' => Category::Shoes->value,
        'subcategory' => Subcategory::Sneakers->value,
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('listings.data', 1)
            ->where('listings.data.0.title', 'Retro sneakers'));
});

test('browse can filter by price range', function () {
    Listing::factory()->create(['price_cents' => 2000, 'title' => 'Cheap tee']);
    Listing::factory()->create(['price_cents' => 10000, 'title' => 'Pricey coat']);

    $this->get(route('browse', ['max_price' => 50]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('listings.data', 1)
            ->where('listings.data.0.title', 'Cheap tee'));
});

test('browse can filter by store rating', function () {
    $goodShop = Shop::factory()->verified()->create();
    $goodShop->forceFill(['rating_avg' => 4.6, 'ratings_count' => 5])->save();
    Listing::factory()->for($goodShop)->create(['title' => 'From a top shop']);

    $poorShop = Shop::factory()->verified()->create();
    $poorShop->forceFill(['rating_avg' => 2.0, 'ratings_count' => 4])->save();
    Listing::factory()->for($poorShop)->create(['title' => 'From a low shop']);

    $this->get(route('browse', ['min_rating' => 4]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('listings.data', 1)
            ->where('listings.data.0.title', 'From a top shop'));
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
