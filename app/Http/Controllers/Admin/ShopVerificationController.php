<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ShopStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectShopRequest;
use App\Models\Shop;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShopVerificationController extends Controller
{
    /**
     * List shops awaiting review alongside recently decided ones.
     */
    public function index(): Response
    {
        return Inertia::render('admin/shops', [
            'pending' => Shop::with('owner:id,name,email')
                ->where('status', ShopStatus::Pending)
                ->latest()
                ->get(),
            'decided' => Shop::with('owner:id,name,email')
                ->whereIn('status', [ShopStatus::Verified, ShopStatus::Rejected, ShopStatus::Suspended])
                ->latest('updated_at')
                ->limit(50)
                ->get(),
        ]);
    }

    public function verify(Shop $shop): RedirectResponse
    {
        $shop->update([
            'status' => ShopStatus::Verified,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':shop is now verified.', ['shop' => $shop->name])]);

        return back();
    }

    public function reject(RejectShopRequest $request, Shop $shop): RedirectResponse
    {
        $shop->update([
            'status' => ShopStatus::Rejected,
            'verified_at' => null,
            'rejection_reason' => $request->validated('reason'),
        ]);

        Inertia::flash('toast', ['type' => 'info', 'message' => __(':shop was rejected.', ['shop' => $shop->name])]);

        return back();
    }

    public function suspend(Shop $shop): RedirectResponse
    {
        $shop->update([
            'status' => ShopStatus::Suspended,
            'verified_at' => null,
        ]);

        Inertia::flash('toast', ['type' => 'warning', 'message' => __(':shop was suspended.', ['shop' => $shop->name])]);

        return back();
    }
}
