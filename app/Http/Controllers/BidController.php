<?php

namespace App\Http\Controllers;

use App\Exceptions\BidException;
use App\Models\Listing;
use App\Services\BidService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BidController extends Controller
{
    public function __construct(private readonly BidService $bids) {}

    /**
     * Place a bid on an auction listing. Amounts are entered in dollars.
     */
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $auction = $listing->auction;

        abort_if($auction === null, 404);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:1000000'],
        ]);

        $amountCents = (int) round(((float) $validated['amount']) * 100);

        try {
            $this->bids->place($auction, $request->user(), $amountCents);
        } catch (BidException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Bid placed — you are the highest bidder!')]);

        return back();
    }
}
