<?php

namespace App\Enums;

enum ListingType: string
{
    case Auction = 'auction';
    case Fixed = 'fixed';

    public function label(): string
    {
        return match ($this) {
            self::Auction => 'Auction',
            self::Fixed => 'Buy Now',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type): array => ['value' => $type->value, 'label' => $type->label()],
            self::cases(),
        );
    }
}
