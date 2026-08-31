<?php

namespace App\Enums;

enum ListingStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Ended = 'ended';
    case Sold = 'sold';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            self::Ended => 'Ended',
            self::Sold => 'Sold',
        };
    }
}
