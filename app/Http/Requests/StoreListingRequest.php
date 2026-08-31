<?php

namespace App\Http\Requests;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\ListingType;
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

    protected function prepareForValidation(): void
    {
        // Category is enforced by the enum; electronics/furniture can never pass.
        $this->merge([
            'category' => is_string($this->category) ? strtolower($this->category) : $this->category,
        ]);
    }
}
