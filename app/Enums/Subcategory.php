<?php

namespace App\Enums;

enum Subcategory: string
{
    // Clothing
    case TShirts = 't-shirts';
    case ShirtsBlouses = 'shirts-blouses';
    case PoloShirts = 'polo-shirts';
    case Dresses = 'dresses';
    case Skirts = 'skirts';
    case Pants = 'pants';
    case Jeans = 'jeans';
    case Shorts = 'shorts';
    case Jackets = 'jackets';
    case HoodiesSweaters = 'hoodies-sweaters';
    case Activewear = 'activewear';

    // Shared style (Clothing + Watches)
    case Vintage = 'vintage';

    // Bags
    case ShoulderBags = 'shoulder-bags';
    case Handbags = 'handbags';
    case CrossbodyBags = 'crossbody-bags';
    case SlingBags = 'sling-bags';
    case ToteBags = 'tote-bags';
    case Backpacks = 'backpacks';
    case Wallets = 'wallets';
    case Pouches = 'pouches';

    // Shoes
    case Sneakers = 'sneakers';
    case CasualShoes = 'casual-shoes';
    case Boots = 'boots';
    case Sandals = 'sandals';
    case Heels = 'heels';
    case Flats = 'flats';
    case Slides = 'slides';

    // Watches
    case Analog = 'analog';
    case Digital = 'digital';
    case Sports = 'sports';
    case Luxury = 'luxury';

    // Accessories
    case CapsHats = 'caps-hats';
    case Sunglasses = 'sunglasses';
    case Belts = 'belts';
    case Scarves = 'scarves';
    case Ties = 'ties';
    case HairAccessories = 'hair-accessories';

    // Jewelry
    case Necklaces = 'necklaces';
    case Earrings = 'earrings';
    case Bracelets = 'bracelets';
    case Rings = 'rings';
    case Brooches = 'brooches';

    public function label(): string
    {
        return match ($this) {
            self::TShirts => 'T-Shirts',
            self::ShirtsBlouses => 'Shirts / Blouses',
            self::PoloShirts => 'Polo Shirts',
            self::Dresses => 'Dresses',
            self::Skirts => 'Skirts',
            self::Pants => 'Pants',
            self::Jeans => 'Jeans',
            self::Shorts => 'Shorts',
            self::Jackets => 'Jackets',
            self::HoodiesSweaters => 'Hoodies / Sweaters',
            self::Activewear => 'Activewear',
            self::Vintage => 'Vintage',
            self::ShoulderBags => 'Shoulder Bags',
            self::Handbags => 'Handbags',
            self::CrossbodyBags => 'Crossbody Bags',
            self::SlingBags => 'Sling Bags',
            self::ToteBags => 'Tote Bags',
            self::Backpacks => 'Backpacks',
            self::Wallets => 'Wallets',
            self::Pouches => 'Pouches',
            self::Sneakers => 'Sneakers',
            self::CasualShoes => 'Casual Shoes',
            self::Boots => 'Boots',
            self::Sandals => 'Sandals',
            self::Heels => 'Heels',
            self::Flats => 'Flats',
            self::Slides => 'Slides',
            self::Analog => 'Analog',
            self::Digital => 'Digital',
            self::Sports => 'Sports',
            self::Luxury => 'Luxury',
            self::CapsHats => 'Caps / Hats',
            self::Sunglasses => 'Sunglasses',
            self::Belts => 'Belts',
            self::Scarves => 'Scarves',
            self::Ties => 'Ties',
            self::HairAccessories => 'Hair Accessories',
            self::Necklaces => 'Necklaces',
            self::Earrings => 'Earrings',
            self::Bracelets => 'Bracelets',
            self::Rings => 'Rings',
            self::Brooches => 'Brooches',
        };
    }

    /**
     * @param  array<int, self>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    public static function optionsFor(array $cases): array
    {
        return array_map(
            fn (self $subcategory): array => ['value' => $subcategory->value, 'label' => $subcategory->label()],
            $cases,
        );
    }
}
