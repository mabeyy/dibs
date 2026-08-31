<?php

namespace App\Enums;

enum Category: string
{
    case Clothing = 'clothing';
    case Bags = 'bags';
    case Shoes = 'shoes';
    case Watches = 'watches';
    case Accessories = 'accessories';
    case Jewelry = 'jewelry';

    public function label(): string
    {
        return match ($this) {
            self::Clothing => 'Clothing',
            self::Bags => 'Bags',
            self::Shoes => 'Shoes',
            self::Watches => 'Watches',
            self::Accessories => 'Accessories',
            self::Jewelry => 'Jewelry',
        };
    }

    /**
     * The subcategories that belong to this fashion category.
     *
     * @return array<int, Subcategory>
     */
    public function subcategories(): array
    {
        return match ($this) {
            self::Clothing => [
                Subcategory::TShirts,
                Subcategory::ShirtsBlouses,
                Subcategory::PoloShirts,
                Subcategory::Dresses,
                Subcategory::Skirts,
                Subcategory::Pants,
                Subcategory::Jeans,
                Subcategory::Shorts,
                Subcategory::Jackets,
                Subcategory::HoodiesSweaters,
                Subcategory::Activewear,
                Subcategory::Vintage,
            ],
            self::Bags => [
                Subcategory::ShoulderBags,
                Subcategory::Handbags,
                Subcategory::CrossbodyBags,
                Subcategory::SlingBags,
                Subcategory::ToteBags,
                Subcategory::Backpacks,
                Subcategory::Wallets,
                Subcategory::Pouches,
            ],
            self::Shoes => [
                Subcategory::Sneakers,
                Subcategory::CasualShoes,
                Subcategory::Boots,
                Subcategory::Sandals,
                Subcategory::Heels,
                Subcategory::Flats,
                Subcategory::Slides,
            ],
            self::Watches => [
                Subcategory::Analog,
                Subcategory::Digital,
                Subcategory::Sports,
                Subcategory::Vintage,
                Subcategory::Luxury,
            ],
            self::Accessories => [
                Subcategory::CapsHats,
                Subcategory::Sunglasses,
                Subcategory::Belts,
                Subcategory::Scarves,
                Subcategory::Ties,
                Subcategory::HairAccessories,
            ],
            self::Jewelry => [
                Subcategory::Necklaces,
                Subcategory::Earrings,
                Subcategory::Bracelets,
                Subcategory::Rings,
                Subcategory::Brooches,
            ],
        };
    }

    /**
     * Whether the given subcategory is valid for this category.
     */
    public function allows(Subcategory $subcategory): bool
    {
        return in_array($subcategory, $this->subcategories(), true);
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category): array => ['value' => $category->value, 'label' => $category->label()],
            self::cases(),
        );
    }

    /**
     * Subcategory options keyed by category value, for dependent selects.
     *
     * @return array<string, array<int, array{value: string, label: string}>>
     */
    public static function subcategoryMap(): array
    {
        $map = [];

        foreach (self::cases() as $category) {
            $map[$category->value] = Subcategory::optionsFor($category->subcategories());
        }

        return $map;
    }
}
