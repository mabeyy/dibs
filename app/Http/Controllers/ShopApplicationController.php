<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShopRequest;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ShopApplicationController extends Controller
{
    /**
     * Show the "become a seller" application form, or the pending/rejected
     * status if the user has already applied.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('seller/apply', [
            'shop' => $request->user()->shop,
        ]);
    }

    /**
     * Submit an application to open a shop. Shops start pending review.
     */
    public function store(StoreShopRequest $request): RedirectResponse
    {
        Shop::create([
            'owner_id' => $request->user()->id,
            'name' => $request->validated('name'),
            'slug' => $this->uniqueSlug($request->validated('name')),
            'bio' => $request->validated('bio'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Application submitted. We will review your shop shortly.')]);

        return to_route('seller.apply');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (Shop::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
