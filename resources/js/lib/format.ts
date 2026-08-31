/**
 * Format an amount stored in minor units (cents) as a currency string.
 */
export function formatCents(
    cents: number | null | undefined,
    currency = 'USD',
): string {
    if (cents === null || cents === undefined) {
        return '—';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

const CONDITION_LABELS: Record<string, string> = {
    new_with_tags: 'New with tags',
    like_new: 'Like new',
    good: 'Good',
    fair: 'Fair',
};

export function conditionLabel(condition: string): string {
    return CONDITION_LABELS[condition] ?? condition;
}

export function titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * A compact human countdown to a future ISO date, e.g. "2d 4h" or "Ended".
 */
export function timeRemaining(endsAt: string): string {
    const diffMs = new Date(endsAt).getTime() - Date.now();
    if (diffMs <= 0) {
        return 'Ended';
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
