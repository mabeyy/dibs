<?php

namespace App\Enums;

enum ItemCondition: string
{
    case NewWithTags = 'new_with_tags';
    case LikeNew = 'like_new';
    case Good = 'good';
    case Fair = 'fair';

    public function label(): string
    {
        return match ($this) {
            self::NewWithTags => 'New with tags',
            self::LikeNew => 'Like new',
            self::Good => 'Good',
            self::Fair => 'Fair',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $condition): array => ['value' => $condition->value, 'label' => $condition->label()],
            self::cases(),
        );
    }
}
