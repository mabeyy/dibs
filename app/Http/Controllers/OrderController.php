<?php

namespace App\Http\Controllers;

use App\Enums\ListingType;
use App\Enums\OrderStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    /**
     * Buyer's purchases and, if they run a shop, their sales.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('orders/index', [
            'purchases' => Order::query()
                ->where('buyer_id', $user->id)
                ->with(['listing.images', 'shop:id,name,slug', 'review:id,order_id,rating'])
                ->latest()
                ->get(),
            'sales' => $user->shop
                ? Order::query()
                    ->where('shop_id', $user->shop->id)
                    ->with(['listing.images', 'buyer:id,name'])
                    ->latest()
                    ->get()
                : [],
        ]);
    }

    /**
     * Buy a fixed-price listing now.
     */
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        if ($listing->type !== ListingType::Fixed) {
            throw ValidationException::withMessages(['listing' => 'This item is sold by auction.']);
        }

        if ($listing->shop->owner_id === $request->user()->id) {
            throw ValidationException::withMessages(['listing' => 'You cannot buy from your own shop.']);
        }

        try {
            $this->orders->place($listing, $request->user(), (int) $listing->price_cents);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages(['listing' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase confirmed! Arrange payment with the shop.')]);

        return to_route('orders.index');
    }

    public function ship(Order $order): RedirectResponse
    {
        $this->authorize('ship', $order);

        $order->update([
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Marked as shipped.')]);

        return back();
    }

    public function receive(Order $order): RedirectResponse
    {
        $this->authorize('receive', $order);

        $order->update([
            'status' => OrderStatus::Completed,
            'received_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order completed. You can now review the shop.')]);

        return back();
    }
}
