<?php

namespace App\Services;

use App\Enums\ListingStatus;
use App\Models\Auction;
use App\Models\User;
use App\Notifications\AuctionEndedNotification;
use App\Notifications\AuctionWonNotification;
use Illuminate\Support\Facades\DB;

class AuctionService
{
    public function __construct(private readonly OrderService $orders) {}

    /**
     * Settle every auction whose time is up and that hasn't been closed yet.
     *
     * @return int the number of auctions closed
     */
    public function closeExpired(): int
    {
        $due = Auction::query()
            ->whereNull('closed_at')
            ->where('ends_at', '<=', now())
            ->pluck('id');

        $closed = 0;
        foreach ($due as $auctionId) {
            if ($this->close($auctionId)) {
                $closed++;
            }
        }

        return $closed;
    }

    /**
     * Settle a single auction: award to the high bidder if the reserve is met,
     * otherwise mark the listing ended. Idempotent — a closed auction is skipped.
     */
    public function close(int $auctionId): bool
    {
        return DB::transaction(function () use ($auctionId): bool {
            /** @var Auction $auction */
            $auction = Auction::whereKey($auctionId)
                ->with('listing.shop.owner')
                ->lockForUpdate()
                ->firstOrFail();

            if ($auction->isClosed() || $auction->ends_at->isFuture()) {
                return false;
            }

            $auction->closed_at = now();
            $listing = $auction->listing;
            $seller = $listing->shop->owner;

            if ($auction->current_bid_cents !== null && $auction->reserveMet()) {
                $winner = User::findOrFail($auction->high_bidder_id);
                $auction->winner_id = $winner->id;
                $auction->save();

                $this->orders->place($listing, $winner, $auction->current_bid_cents);

                $winner->notify(new AuctionWonNotification($listing, $auction->current_bid_cents));
                $seller?->notify(new AuctionEndedNotification($listing, sold: true));

                return true;
            }

            // No qualifying bid — the listing simply ends.
            $auction->save();
            $listing->update(['status' => ListingStatus::Ended]);
            $seller?->notify(new AuctionEndedNotification($listing, sold: false));

            return true;
        });
    }
}
