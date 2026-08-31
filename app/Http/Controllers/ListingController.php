<?php

namespace App\Http\Controllers;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    /**
     * List the current seller's own listings.
     */
    public function index(Request $request): Response
    {
        $shop = $request->user()->shop;

        return Inertia::render('seller/listings/index', [
            'shop' => $shop,
            'listings' => $shop
                ? $shop->listings()->with(['images', 'auction'])->latest()->get()
                : [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('seller/listings/create', [
            'categories' => Category::options(),
            'conditions' => ItemCondition::options(),
            'types' => ListingType::options(),
        ]);
    }

    public function store(StoreListingRequest $request): RedirectResponse
    {
        $shop = $request->user()->shop;
        $data = $request->validated();
        $isAuction = $data['type'] === ListingType::Auction->value;

        $listing = DB::transaction(function () use ($shop, $request, $data, $isAuction): Listing {
            $listing = $shop->listings()->create([
                'category' => $data['category'],
                'type' => $data['type'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'brand' => $data['brand'] ?? null,
                'size' => $data['size'] ?? null,
                'condition' => $data['condition'],
                'price_cents' => $isAuction ? null : $this->toCents($data['price']),
                'status' => ListingStatus::Active,
            ]);

            if ($isAuction) {
                $listing->auction()->create([
                    'starting_bid_cents' => $this->toCents($data['starting_bid']),
                    'reserve_price_cents' => isset($data['reserve_price']) ? $this->toCents($data['reserve_price']) : null,
                    'min_increment_cents' => 100,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays((int) $data['duration_days']),
                ]);
            }

            $this->storeImages($listing, $request);

            return $listing;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('":title" is now live.', ['title' => $listing->title])]);

        return to_route('seller.listings.index');
    }

    public function edit(Listing $listing): Response
    {
        $this->authorize('update', $listing);

        return Inertia::render('seller/listings/edit', [
            'listing' => $listing->load(['images', 'auction']),
            'categories' => Category::options(),
            'conditions' => ItemCondition::options(),
        ]);
    }

    public function update(UpdateListingRequest $request, Listing $listing): RedirectResponse
    {
        $data = $request->validated();

        $listing->fill([
            'category' => $data['category'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'brand' => $data['brand'] ?? null,
            'size' => $data['size'] ?? null,
            'condition' => $data['condition'],
        ]);

        // Price is only meaningful for fixed-price listings.
        if (! $listing->isAuction() && isset($data['price'])) {
            $listing->price_cents = $this->toCents($data['price']);
        }

        $listing->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Listing updated.')]);

        return to_route('seller.listings.index');
    }

    public function destroy(Listing $listing): RedirectResponse
    {
        $this->authorize('delete', $listing);

        foreach ($listing->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $listing->delete();

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Listing removed.')]);

        return to_route('seller.listings.index');
    }

    private function storeImages(Listing $listing, Request $request): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        foreach ($request->file('images') as $index => $file) {
            $listing->images()->create([
                'path' => $file->store('listings', 'public'),
                'sort_order' => $index,
            ]);
        }
    }

    private function toCents(int|float|string $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }
}
