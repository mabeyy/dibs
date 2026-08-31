<?php

namespace App\Http\Requests;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Listing $listing */
        $listing = $this->route('listing');

        return $this->user()->can('update', $listing);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', new Enum(Category::class)],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'brand' => ['nullable', 'string', 'max:80'],
            'size' => ['nullable', 'string', 'max:40'],
            'condition' => ['required', new Enum(ItemCondition::class)],
            // Only fixed-price listings expose an editable price.
            'price' => ['nullable', 'numeric', 'min:0.01', 'max:1000000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'category' => is_string($this->category) ? strtolower($this->category) : $this->category,
        ]);
    }
}
