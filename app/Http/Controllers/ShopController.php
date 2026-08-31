<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Models\Shop;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    /**
     * Public shop storefront: active listings and reviews.
     */
    public function show(Shop $shop): Response
    {
        return Inertia::render('shops/show', [
            'shop' => $shop->only(['id', 'name', 'slug', 'bio', 'rating_avg', 'ratings_count']),
            'listings' => $shop->listings()
                ->where('status', ListingStatus::Active)
                ->with(['images', 'shop:id,name,slug,rating_avg,ratings_count', 'auction'])
                ->latest()
                ->get(),
            'reviews' => $shop->reviews()
                ->with('buyer:id,name')
                ->latest()
                ->limit(50)
                ->get(),
        ]);
    }
}
