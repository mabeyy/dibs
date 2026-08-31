<?php

namespace App\Http\Requests;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingType;
use App\Enums\Subcategory;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreListingRequest extends FormRequest
{
    /**
     * Only a verified shop owner may list items.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()->shop?->isVerified();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', new Enum(Category::class)],
            'subcategory' => ['required', new Enum(Subcategory::class), $this->subcategoryBelongsToCategory()],
            'type' => ['required', new Enum(ListingType::class)],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'brand' => ['nullable', 'string', 'max:80'],
            'size' => ['nullable', 'string', 'max:40'],
            'condition' => ['required', new Enum(ItemCondition::class)],

            // Fixed-price listings.
            'price' => ['nullable', 'required_if:type,fixed', 'numeric', 'min:0.01', 'max:1000000'],

            // Auction listings.
            'starting_bid' => ['nullable', 'required_if:type,auction', 'numeric', 'min:0.01', 'max:1000000'],
            'reserve_price' => ['nullable', 'numeric', 'gte:starting_bid', 'max:1000000'],
            'duration_days' => ['nullable', 'required_if:type,auction', 'integer', 'min:1', 'max:14'],

            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reserve_price.gte' => 'The reserve price must be at least the starting bid.',
        ];
    }

    /**
     * Reject a subcategory that does not belong to the chosen category
     * (e.g. "sneakers" under "watches").
     */
    protected function subcategoryBelongsToCategory(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $category = is_string($this->category) ? Category::tryFrom($this->category) : null;
            $subcategory = is_string($value) ? Subcategory::tryFrom($value) : null;

            // The individual enum rules already report malformed values.
            if ($category === null || $subcategory === null) {
                return;
            }

            if (! $category->allows($subcategory)) {
                $fail('The selected subcategory is not available for this category.');
            }
        };
    }

    protected function prepareForValidation(): void
    {
        // Category is enforced by the enum; electronics/furniture can never pass.
        $this->merge([
            'category' => is_string($this->category) ? strtolower($this->category) : $this->category,
            'subcategory' => is_string($this->subcategory) ? strtolower($this->subcategory) : $this->subcategory,
        ]);
    }
}
