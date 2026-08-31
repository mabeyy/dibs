<?php

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Models\Listing;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function verifiedSeller(): array
{
    $user = User::factory()->create();
    $shop = Shop::factory()->verified()->for($user, 'owner')->create();

    return [$user, $shop];
}

test('a verified seller can create a fixed-price listing that goes live', function () {
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Clothing->value,
        'type' => ListingType::Fixed->value,
        'title' => 'Vintage denim jacket',
        'condition' => ItemCondition::Good->value,
        'price' => 45.50,
    ])->assertRedirect(route('seller.listings.index'));

    $listing = Listing::sole();
    expect($listing->status)->toBe(ListingStatus::Active)
        ->and($listing->price_cents)->toBe(4550)
        ->and($listing->category)->toBe(Category::Clothing);
});

test('creating an auction listing builds an auction and leaves price null', function () {
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Watches->value,
        'type' => ListingType::Auction->value,
        'title' => 'Seiko diver',
        'condition' => ItemCondition::LikeNew->value,
        'starting_bid' => 20,
        'reserve_price' => 50,
        'duration_days' => 5,
    ])->assertRedirect();

    $listing = Listing::with('auction')->sole();
    expect($listing->price_cents)->toBeNull()
        ->and($listing->auction)->not->toBeNull()
        ->and($listing->auction->starting_bid_cents)->toBe(2000)
        ->and($listing->auction->reserve_price_cents)->toBe(5000)
        ->and($listing->auction->ends_at->isFuture())->toBeTrue();
});

test('electronics and other categories are rejected by the enum', function () {
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => 'electronics',
        'type' => ListingType::Fixed->value,
        'title' => 'Old phone',
        'condition' => ItemCondition::Good->value,
        'price' => 100,
    ])->assertSessionHasErrors('category');

    expect(Listing::count())->toBe(0);
});

test('a seller without a verified shop cannot create listings', function () {
    $user = User::factory()->create();
    Shop::factory()->for($user, 'owner')->create(); // pending

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Bags->value,
        'type' => ListingType::Fixed->value,
        'title' => 'Leather tote',
        'condition' => ItemCondition::Good->value,
        'price' => 80,
    ])->assertForbidden();
});

test('a fixed listing requires a price', function () {
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Bags->value,
        'type' => ListingType::Fixed->value,
        'title' => 'Leather tote',
        'condition' => ItemCondition::Good->value,
    ])->assertSessionHasErrors('price');
});

test('reserve price cannot be below the starting bid', function () {
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Watches->value,
        'type' => ListingType::Auction->value,
        'title' => 'Watch',
        'condition' => ItemCondition::Good->value,
        'starting_bid' => 100,
        'reserve_price' => 50,
        'duration_days' => 3,
    ])->assertSessionHasErrors('reserve_price');
});

test('uploaded images are stored and linked to the listing', function () {
    Storage::fake('public');
    [$user] = verifiedSeller();

    $this->actingAs($user)->post(route('seller.listings.store'), [
        'category' => Category::Clothing->value,
        'type' => ListingType::Fixed->value,
        'title' => 'Wool coat',
        'condition' => ItemCondition::Good->value,
        'price' => 120,
        'images' => [
            UploadedFile::fake()->image('front.jpg'),
            UploadedFile::fake()->image('back.jpg'),
        ],
    ]);

    $listing = Listing::with('images')->sole();
    expect($listing->images)->toHaveCount(2);
    Storage::disk('public')->assertExists($listing->images->first()->path);
});

test('a seller can update their own listing but not another seller\'s', function () {
    [$owner] = verifiedSeller();
    $listing = Listing::factory()->for(Shop::where('owner_id', $owner->id)->sole())->create();

    $this->actingAs($owner)->patch(route('seller.listings.update', $listing), [
        'category' => $listing->category->value,
        'title' => 'Updated title',
        'condition' => $listing->condition->value,
        'price' => 99,
    ])->assertRedirect();

    expect($listing->refresh()->title)->toBe('Updated title');

    $other = User::factory()->create();
    $this->actingAs($other)->patch(route('seller.listings.update', $listing), [
        'category' => $listing->category->value,
        'title' => 'Hijacked',
        'condition' => $listing->condition->value,
    ])->assertForbidden();
});

test('a sold listing cannot be deleted', function () {
    [$owner] = verifiedSeller();
    $listing = Listing::factory()
        ->for(Shop::where('owner_id', $owner->id)->sole())
        ->create(['status' => ListingStatus::Sold]);

    $this->actingAs($owner)->delete(route('seller.listings.destroy', $listing))->assertForbidden();
    expect(Listing::whereKey($listing->id)->exists())->toBeTrue();
});
