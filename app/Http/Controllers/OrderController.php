<?php

namespace App\Http\Controllers;

use App\Enums\ListingStatus;
use App\Enums\ListingType;
use App\Enums\OrderStatus;
use App\Models\Listing;
use App\Models\Order;
use App\Notifications\NewSaleNotification;
use App\Notifications\OrderCancelledNotification;
use App\Notifications\OrderShippedNotification;
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
     * Buy a fixed-price listing now, capturing where to ship it.
     */
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        if ($listing->type !== ListingType::Fixed) {
            throw ValidationException::withMessages(['listing' => 'This item is sold by auction.']);
        }

        if ($listing->status !== ListingStatus::Active) {
            throw ValidationException::withMessages(['listing' => 'This item is no longer available.']);
        }

        if ($listing->shop->owner_id === $request->user()->id) {
            throw ValidationException::withMessages(['listing' => 'You cannot buy from your own shop.']);
        }

        $shipping = $request->validate($this->shippingRules());

        try {
            $order = $this->orders->place($listing, $request->user(), (int) $listing->price_cents, $shipping);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages(['listing' => $e->getMessage()]);
        }

        $listing->shop->owner?->notify(new NewSaleNotification($order->load('listing')));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Purchase confirmed! The shop will arrange shipping.')]);

        return to_route('orders.index');
    }

    /**
     * Buyer sets or updates the shipping address (used after winning an auction).
     */
    public function updateShippingAddress(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('updateShippingAddress', $order);

        $order->update($request->validate($this->shippingRules()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Shipping address saved.')]);

        return back();
    }

    /**
     * Seller records the shipment with carrier and tracking details.
     */
    public function ship(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('ship', $order);

        if (! $order->hasShippingAddress()) {
            throw ValidationException::withMessages([
                'order' => 'The buyer has not provided a shipping address yet.',
            ]);
        }

        $data = $request->validate([
            'shipping_carrier' => ['required', 'string', 'max:80'],
            'tracking_number' => ['required', 'string', 'max:120'],
        ]);

        $order->update([
            'status' => OrderStatus::Shipped,
            'shipped_at' => now(),
            'shipping_carrier' => $data['shipping_carrier'],
            'tracking_number' => $data['tracking_number'],
        ]);

        $order->buyer->notify(new OrderShippedNotification($order->load('listing')));

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

    /**
     * Buyer cancels, or seller declines, a still-pending order.
     */
    public function cancel(Request $request, Order $order): RedirectResponse
    {
        $this->authorize('cancel', $order);

        $order->loadMissing('shop', 'buyer', 'listing');
        $cancelledBySeller = $request->user()->id === $order->shop->owner_id;

        try {
            $this->orders->cancel($order);
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages(['order' => $e->getMessage()]);
        }

        // Notify the party who did not initiate the cancellation.
        $recipient = $cancelledBySeller ? $order->buyer : $order->shop->owner;
        $recipient?->notify(new OrderCancelledNotification($order, $cancelledBySeller));

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Order cancelled.')]);

        return back();
    }

    /**
     * Validation rules for a shipping address.
     *
     * @return array<string, array<int, string>>
     */
    private function shippingRules(): array
    {
        return [
            'ship_name' => ['required', 'string', 'max:120'],
            'ship_line1' => ['required', 'string', 'max:160'],
            'ship_line2' => ['nullable', 'string', 'max:160'],
            'ship_city' => ['required', 'string', 'max:100'],
            'ship_region' => ['nullable', 'string', 'max:100'],
            'ship_postal_code' => ['required', 'string', 'max:20'],
            'ship_country' => ['required', 'string', 'max:100'],
            'ship_phone' => ['nullable', 'string', 'max:40'],
        ];
    }
}
