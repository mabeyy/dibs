<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ShopReviewController extends Controller
{
    /**
     * Leave a review for the shop behind a completed order.
     */
    public function store(StoreReviewRequest $request, Order $order): RedirectResponse
    {
        $order->shop->reviews()->create([
            'buyer_id' => $request->user()->id,
            'order_id' => $order->id,
            'rating' => $request->validated('rating'),
            'body' => $request->validated('body'),
        ]);

        $order->shop->recalculateRating();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks for reviewing the shop!')]);

        return back();
    }
}
