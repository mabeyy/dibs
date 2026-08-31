<?php

namespace App\Http\Requests;

use App\Enums\Category;
use App\Enums\ItemCondition;
use App\Enums\Subcategory;
use App\Models\Listing;
use Closure;
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
            'subcategory' => ['required', new Enum(Subcategory::class), $this->subcategoryBelongsToCategory()],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'brand' => ['nullable', 'string', 'max:80'],
            'size' => ['nullable', 'string', 'max:40'],
            'condition' => ['required', new Enum(ItemCondition::class)],
            // Only fixed-price listings expose an editable price.
            'price' => ['nullable', 'numeric', 'min:0.01', 'max:1000000'],
        ];
    }

    /**
     * Reject a subcategory that does not belong to the chosen category.
     */
    protected function subcategoryBelongsToCategory(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $category = is_string($this->category) ? Category::tryFrom($this->category) : null;
            $subcategory = is_string($value) ? Subcategory::tryFrom($value) : null;

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
        $this->merge([
            'category' => is_string($this->category) ? strtolower($this->category) : $this->category,
            'subcategory' => is_string($this->subcategory) ? strtolower($this->subcategory) : $this->subcategory,
        ]);
    }
}
