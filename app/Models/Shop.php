<?php

namespace App\Models;

use App\Enums\ShopStatus;
use Database\Factories\ShopFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $owner_id
 * @property string $name
 * @property string $slug
 * @property string|null $bio
 * @property string|null $logo_path
 * @property ShopStatus $status
 * @property string|null $rejection_reason
 * @property float $rating_avg
 * @property int $ratings_count
 * @property Carbon|null $verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['owner_id', 'name', 'slug', 'bio', 'logo_path', 'status', 'rejection_reason', 'verified_at'])]
class Shop extends Model
{
    /** @use HasFactory<ShopFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => ShopStatus::class,
            'rating_avg' => 'float',
            'ratings_count' => 'integer',
            'verified_at' => 'datetime',
        ];
    }

    public function isVerified(): bool
    {
        return $this->status === ShopStatus::Verified;
    }

    /**
     * Recompute and persist the cached review aggregates.
     */
    public function recalculateRating(): void
    {
        $this->forceFill([
            'rating_avg' => round((float) $this->reviews()->avg('rating'), 2),
            'ratings_count' => $this->reviews()->count(),
        ])->save();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return HasMany<Listing, $this>
     */
    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return HasMany<ShopReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ShopReview::class);
    }
}
