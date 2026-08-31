<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WatchlistController extends Controller
{
    /**
     * The current user's watched listings.
     */
    public function index(Request $request): Response
    {
        $listings = Listing::query()
            ->whereIn('id', $request->user()->watchlists()->pluck('listing_id'))
            ->with(['images', 'shop:id,name,slug,rating_avg,ratings_count', 'auction'])
            ->latest()
            ->get()
            ->each(fn (Listing $listing) => $listing->setAttribute('is_watched', true));

        return Inertia::render('watchlist/index', [
            'listings' => $listings,
        ]);
    }

    /**
     * Add or remove a listing from the user's watchlist.
     */
    public function toggle(Request $request, Listing $listing): RedirectResponse
    {
        abort_if($listing->status === ListingStatus::Draft, 404);

        $existing = $request->user()->watchlists()->where('listing_id', $listing->id)->first();

        if ($existing) {
            $existing->delete();
        } else {
            $request->user()->watchlists()->create(['listing_id' => $listing->id]);
        }

        return back();
    }
}
