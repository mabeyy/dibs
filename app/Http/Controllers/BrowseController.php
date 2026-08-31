<?php

namespace App\Http\Controllers;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class BrowseController extends Controller
{
    /**
     * Public marketplace browse with filters, search and sorting.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', new Enum(Category::class)],
            'condition' => ['nullable', new Enum(ItemCondition::class)],
            'type' => ['nullable', new Enum(ListingType::class)],
            'sort' => ['nullable', 'in:newest,ending_soon,price_low,price_high'],
        ]);

        $sort = $filters['sort'] ?? 'newest';

        $userId = $request->user()?->id;

        $listings = Listing::query()
            ->where('status', ListingStatus::Active)
            ->with(['images', 'shop:id,name,slug,rating_avg,ratings_count', 'auction'])
            ->when($userId, fn ($query) => $query->withExists([
                'watchers as is_watched' => fn ($watchers) => $watchers->where('user_id', $userId),
            ]))
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where(function ($inner) use ($q) {
                $inner->where('title', 'like', "%{$q}%")
                    ->orWhere('brand', 'like', "%{$q}%");
            }))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
            ->when($filters['condition'] ?? null, fn ($query, $condition) => $query->where('condition', $condition))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($sort === 'price_low', fn ($query) => $query->orderByRaw('COALESCE(price_cents, 0) asc'))
            ->when($sort === 'price_high', fn ($query) => $query->orderByRaw('COALESCE(price_cents, 0) desc'))
            ->when($sort === 'ending_soon', fn ($query) => $query
                ->leftJoin('auctions', 'auctions.listing_id', '=', 'listings.id')
                ->orderByRaw('auctions.ends_at is null, auctions.ends_at asc')
                ->select('listings.*'))
            ->when($sort === 'newest', fn ($query) => $query->latest())
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('browse', [
            'listings' => $listings,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'category' => $filters['category'] ?? '',
                'condition' => $filters['condition'] ?? '',
                'type' => $filters['type'] ?? '',
                'sort' => $sort,
            ],
            'categories' => Category::options(),
            'conditions' => ItemCondition::options(),
            'types' => ListingType::options(),
        ]);
    }

    public function show(Request $request, Listing $listing): Response
    {
        abort_if($listing->status === ListingStatus::Draft, 404);

        $listing->load([
            'images',
            'shop:id,name,slug,bio,rating_avg,ratings_count',
            'auction.bids.user:id,name',
        ]);

        $auctionPayload = null;
        if ($listing->auction) {
            $auction = $listing->auction;
            $auctionPayload = [
                ...$auction->toArray(),
                'minimum_next_bid_cents' => $auction->minimumNextBidCents(),
                'bid_count' => $auction->bids->count(),
            ];
        }

        $isWatched = $request->user()
            ? $listing->watchers()->where('user_id', $request->user()->id)->exists()
            : false;

        return Inertia::render('listings/show', [
            'listing' => [
                ...$listing->toArray(),
                'auction' => $auctionPayload,
                'is_watched' => $isWatched,
            ],
            'canBid' => $request->user() !== null,
        ]);
    }
}
