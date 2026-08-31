<?php

namespace App\Enums;

/**
 * Payment lifecycle for an order. The marketplace launches without
 * on-platform payments (Unpaid = arranged off-platform between buyer
 * and shop). The Held/Released states are reserved for the future
 * Stripe Connect escrow flow so the schema does not need to change.
 */
enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Held = 'held';
    case Released = 'released';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Unpaid',
            self::Held => 'Held in escrow',
            self::Released => 'Released to shop',
            self::Refunded => 'Refunded',
        };
    }
}
