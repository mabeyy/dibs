<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $listing_id
 * @property int $buyer_id
 * @property int $shop_id
 * @property int $amount_cents
 * @property OrderStatus $status
 * @property PaymentStatus $payment_status
 * @property string|null $ship_name
 * @property string|null $ship_line1
 * @property string|null $ship_line2
 * @property string|null $ship_city
 * @property string|null $ship_region
 * @property string|null $ship_postal_code
 * @property string|null $ship_country
 * @property string|null $ship_phone
 * @property string|null $shipping_carrier
 * @property string|null $tracking_number
 * @property Carbon|null $shipped_at
 * @property Carbon|null $received_at
 * @property Carbon|null $cancelled_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['listing_id', 'buyer_id', 'shop_id', 'amount_cents', 'status', 'payment_status', 'ship_name', 'ship_line1', 'ship_line2', 'ship_city', 'ship_region', 'ship_postal_code', 'ship_country', 'ship_phone', 'shipping_carrier', 'tracking_number', 'shipped_at', 'received_at', 'cancelled_at'])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'amount_cents' => 'integer',
            'shipped_at' => 'datetime',
            'received_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::Completed;
    }

    /**
     * Whether the buyer has supplied a shipping destination.
     */
    public function hasShippingAddress(): bool
    {
        return $this->ship_line1 !== null;
    }

    /**
     * @return BelongsTo<Listing, $this>
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * @return BelongsTo<Shop, $this>
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * @return HasOne<ShopReview, $this>
     */
    public function review(): HasOne
    {
        return $this->hasOne(ShopReview::class);
    }
}
