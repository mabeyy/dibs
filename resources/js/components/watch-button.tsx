import { router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggle as toggleWatch } from '@/routes/watchlist';

type Props = {
    listingId: number;
    watched?: boolean;
    className?: string;
};

export function WatchButton({ listingId, watched = false, className }: Props) {
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(toggleWatch(listingId).url, {}, { preserveScroll: true });
    };

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            className={cn(
                'flex size-8 items-center justify-center rounded-full bg-white/85 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-black/50 dark:text-neutral-200',
                className,
            )}
        >
            <Heart
                className={cn('size-4', watched && 'fill-red-500 text-red-500')}
            />
        </button>
    );
}
