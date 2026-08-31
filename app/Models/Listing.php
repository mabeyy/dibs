<?php

namespace App\Models;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingStatus;
use App\Enums\ListingType;
use Database\Factories\ListingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $shop_id
 * @property Category $category
 * @property ListingType $type
 * @property string $title
 * @property string|null $description
 * @property string|null $brand
 * @property string|null $size
 * @property ItemCondition $condition
 * @property int|null $price_cents
 * @property ListingStatus $status
 * @property int|null $sold_order_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['category', 'type', 'title', 'description', 'brand', 'size', 'condition', 'price_cents', 'status', 'sold_order_id'])]
class Listing extends Model
{
    /** @use HasFactory<ListingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'category' => Category::class,
            'type' => ListingType::class,
            'condition' => ItemCondition::class,
            'status' => ListingStatus::class,
            'price_cents' => 'integer',
        ];
    }

    public function isAuction(): bool
    {
        return $this->type === ListingType::Auction;
    }

    public function isAvailable(): bool
    {
        return $this->status === ListingStatus::Active;
    }

    /**
     * @return BelongsTo<Shop, $this>
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * @return HasMany<ListingImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class)->orderBy('sort_order');
    }

    /**
     * @return HasOne<Auction, $this>
     */
    public function auction(): HasOne
    {
        return $this->hasOne(Auction::class);
    }

    /**
     * @return HasOne<Order, $this>
     */
    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }

    /**
     * @return HasMany<Watchlist, $this>
     */
    public function watchers(): HasMany
    {
        return $this->hasMany(Watchlist::class);
    }
}
