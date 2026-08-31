<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Models\Listing;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $activeWithRelations = fn () => Listing::query()
            ->where('status', ListingStatus::Active)
            ->with(['images', 'shop:id,name,slug,rating_avg,ratings_count', 'auction']);

        return Inertia::render('home', [
            'endingSoon' => $activeWithRelations()
                ->where('type', ListingType::Auction)
                ->whereHas('auction', fn ($query) => $query->whereNull('closed_at')->where('ends_at', '>', now()))
                ->join('auctions', 'auctions.listing_id', '=', 'listings.id')
                ->orderBy('auctions.ends_at')
                ->select('listings.*')
                ->limit(4)
                ->get(),
            'fresh' => $activeWithRelations()
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
