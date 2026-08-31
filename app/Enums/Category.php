<?php

namespace App\Enums;

enum Category: string
{
    case Clothing = 'clothing';
    case Watches = 'watches';
    case Bags = 'bags';

    public function label(): string
    {
        return match ($this) {
            self::Clothing => 'Clothing',
            self::Watches => 'Watches',
            self::Bags => 'Bags',
        };
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
}
