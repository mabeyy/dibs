<?php

namespace App\Models;

use Database\Factories\AuctionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $listing_id
 * @property int $starting_bid_cents
 * @property int|null $reserve_price_cents
 * @property int $min_increment_cents
 * @property int|null $current_bid_cents
 * @property int|null $high_bidder_id
 * @property int|null $winner_id
 * @property Carbon $starts_at
 * @property Carbon $ends_at
 * @property Carbon|null $closed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['starting_bid_cents', 'reserve_price_cents', 'min_increment_cents', 'current_bid_cents', 'high_bidder_id', 'winner_id', 'starts_at', 'ends_at', 'closed_at'])]
class Auction extends Model
{
    /** @use HasFactory<AuctionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starting_bid_cents' => 'integer',
            'reserve_price_cents' => 'integer',
            'min_increment_cents' => 'integer',
            'current_bid_cents' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function hasStarted(): bool
    {
        return $this->starts_at->isPast();
    }

    public function hasEnded(): bool
    {
        return $this->ends_at->isPast();
    }

    public function isClosed(): bool
    {
        return $this->closed_at !== null;
    }

    public function isLive(): bool
    {
        return $this->hasStarted() && ! $this->hasEnded() && ! $this->isClosed();
    }

    /**
     * The minimum amount (in cents) the next bid must reach.
     */
    public function minimumNextBidCents(): int
    {
        if ($this->current_bid_cents === null) {
            return $this->starting_bid_cents;
        }

        return $this->current_bid_cents + $this->min_increment_cents;
    }

    public function reserveMet(): bool
    {
        if ($this->reserve_price_cents === null) {
            return true;
        }

        return $this->current_bid_cents !== null
            && $this->current_bid_cents >= $this->reserve_price_cents;
    }

    /**
     * @return BelongsTo<Listing, $this>
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * @return HasMany<Bid, $this>
     */
    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class)->latest('amount_cents');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function highBidder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'high_bidder_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
