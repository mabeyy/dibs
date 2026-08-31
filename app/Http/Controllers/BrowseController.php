<?php

namespace App\Http\Controllers;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Enums\Subcategory;
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
            'subcategory' => ['nullable', new Enum(Subcategory::class)],
            'condition' => ['nullable', new Enum(ItemCondition::class)],
            'type' => ['nullable', new Enum(ListingType::class)],
            'min_price' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'min_rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'sort' => ['nullable', 'in:newest,ending_soon,price_low,price_high'],
        ]);

        $sort = $filters['sort'] ?? 'newest';

        $userId = $request->user()?->id;

        // The comparable price of a listing: its fixed price, or the auction's
        // current bid (falling back to the starting bid).
        $effectivePrice = 'COALESCE(listings.price_cents, auctions.current_bid_cents, auctions.starting_bid_cents)';

        $listings = Listing::query()
            ->where('listings.status', ListingStatus::Active)
            ->leftJoin('auctions', 'auctions.listing_id', '=', 'listings.id')
            ->select('listings.*')
            ->with(['images', 'shop:id,name,slug,rating_avg,ratings_count', 'auction'])
            ->when($userId, fn ($query) => $query->withExists([
                'watchers as is_watched' => fn ($watchers) => $watchers->where('user_id', $userId),
            ]))
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where(function ($inner) use ($q) {
                $inner->where('listings.title', 'like', "%{$q}%")
                    ->orWhere('listings.brand', 'like', "%{$q}%");
            }))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('listings.category', $category))
            ->when($filters['subcategory'] ?? null, fn ($query, $subcategory) => $query->where('listings.subcategory', $subcategory))
            ->when($filters['condition'] ?? null, fn ($query, $condition) => $query->where('listings.condition', $condition))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('listings.type', $type))
            ->when($filters['min_price'] ?? null, fn ($query, $min) => $query->whereRaw("{$effectivePrice} >= ?", [(int) round($min * 100)]))
            ->when($filters['max_price'] ?? null, fn ($query, $max) => $query->whereRaw("{$effectivePrice} <= ?", [(int) round($max * 100)]))
            ->when($filters['min_rating'] ?? null, fn ($query, $rating) => $query->whereHas('shop', fn ($shop) => $shop->where('rating_avg', '>=', $rating)))
            ->when($sort === 'price_low', fn ($query) => $query->orderByRaw("{$effectivePrice} asc"))
            ->when($sort === 'price_high', fn ($query) => $query->orderByRaw("{$effectivePrice} desc"))
            ->when($sort === 'ending_soon', fn ($query) => $query->orderByRaw('auctions.ends_at is null, auctions.ends_at asc'))
            ->when($sort === 'newest', fn ($query) => $query->orderByDesc('listings.created_at'))
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('browse', [
            'listings' => $listings,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'category' => $filters['category'] ?? '',
                'subcategory' => $filters['subcategory'] ?? '',
                'condition' => $filters['condition'] ?? '',
                'type' => $filters['type'] ?? '',
                'min_price' => $filters['min_price'] ?? '',
                'max_price' => $filters['max_price'] ?? '',
                'min_rating' => $filters['min_rating'] ?? '',
                'sort' => $sort,
            ],
            'categories' => Category::options(),
            'subcategories' => Category::subcategoryMap(),
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
