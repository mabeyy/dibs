import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    rating: number;
    /** Enables click-to-rate. */
    onRate?: (value: number) => void;
    size?: number;
    className?: string;
};

export function RatingStars({ rating, onRate, size = 16, className }: Props) {
    const interactive = typeof onRate === 'function';

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[1, 2, 3, 4, 5].map((value) => {
                const filled = value <= Math.round(rating);
                const star = (
                    <Star
                        style={{ width: size, height: size }}
                        className={
                            filled
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/40'
                        }
                    />
                );

                return interactive ? (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onRate!(value)}
                        aria-label={`${value} stars`}
                    >
                        {star}
                    </button>
                ) : (
                    <span key={value}>{star}</span>
                );
            })}
        </div>
    );
}
