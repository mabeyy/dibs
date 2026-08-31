<?php

namespace App\Models;

use Database\Factories\ListingImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $listing_id
 * @property string $path
 * @property int $sort_order
 * @property-read string $url
 */
#[Fillable(['path', 'sort_order'])]
class ListingImage extends Model
{
    /** @use HasFactory<ListingImageFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::get(fn (): string => Storage::disk('public')->url($this->path));
    }

    /**
     * @return BelongsTo<Listing, $this>
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
