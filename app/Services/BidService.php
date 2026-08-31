<?php

namespace App\Services;

use App\Exceptions\BidException;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\User;
use App\Notifications\OutbidNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class BidService
{
    /**
     * How close to the end a bid must land to trigger an extension.
     */
    public const int ANTI_SNIPE_WINDOW_SECONDS = 120;

    /**
     * How long the auction is extended when a late bid lands.
     */
    public const int ANTI_SNIPE_EXTENSION_SECONDS = 120;

    /**
     * Place a bid on an auction.
     *
     * The auction row is locked for the duration of the transaction so two
     * concurrent bids can never both win against the same current price.
     *
     * @throws BidException
     */
    public function place(Auction $auction, User $bidder, int $amountCents): Bid
    {
        return DB::transaction(function () use ($auction, $bidder, $amountCents): Bid {
            /** @var Auction $locked */
            $locked = Auction::whereKey($auction->id)->with('listing.shop')->lockForUpdate()->firstOrFail();

            if (! $locked->hasStarted()) {
                throw new BidException('This auction has not started yet.');
            }

            if ($locked->hasEnded() || $locked->isClosed()) {
                throw new BidException('This auction has ended.');
            }

            if ($locked->listing->shop->owner_id === $bidder->id) {
                throw new BidException('You cannot bid on your own auction.');
            }

            $minimum = $locked->minimumNextBidCents();
            if ($amountCents < $minimum) {
                throw new BidException("Your bid must be at least {$minimum} cents.");
            }

            $previousHighBidderId = $locked->high_bidder_id;

            $bid = $locked->bids()->create([
                'user_id' => $bidder->id,
                'amount_cents' => $amountCents,
            ]);

            $locked->current_bid_cents = $amountCents;
            $locked->high_bidder_id = $bidder->id;

            // Anti-snipe: a bid in the final moments pushes the deadline out so
            // nobody can win by bidding at the very last second.
            if ($locked->ends_at->diffInSeconds(now(), absolute: true) <= self::ANTI_SNIPE_WINDOW_SECONDS
                && $locked->ends_at->isFuture()) {
                $locked->ends_at = now()->addSeconds(self::ANTI_SNIPE_EXTENSION_SECONDS);
            }

            $locked->save();

            if ($previousHighBidderId && $previousHighBidderId !== $bidder->id) {
                $previous = User::find($previousHighBidderId);
                if ($previous) {
                    Notification::send($previous, new OutbidNotification($locked->listing, $amountCents));
                }
            }

            return $bid;
        });
    }
}
