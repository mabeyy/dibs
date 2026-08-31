import { Link } from '@inertiajs/react';
import { Clock, ImageOff, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WatchButton } from '@/components/watch-button';
import { conditionLabel, formatCents, timeRemaining } from '@/lib/format';
import { show as showListing } from '@/routes/listings';
import type { Listing } from '@/types';

export function ListingCard({ listing }: { listing: Listing }) {
    const cover = listing.images?.[0];
    const isAuction = listing.type === 'auction';
    const priceCents = isAuction
        ? (listing.auction?.current_bid_cents ??
          listing.auction?.starting_bid_cents ??
          null)
        : listing.price_cents;

    return (
        <Link
            href={showListing(listing.id).url}
            className="group border-border/70 bg-card hover:border-border flex flex-col overflow-hidden rounded-xl border transition"
        >
            <div className="bg-muted relative aspect-square overflow-hidden">
                {cover ? (
                    <img
                        src={cover.url}
                        alt={listing.title}
                        className="size-full object-cover transition group-hover:scale-105"
                    />
                ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                        <ImageOff className="size-8" />
                    </div>
                )}
                {isAuction && (
                    <Badge className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/70">
                        Auction
                    </Badge>
                )}
                <WatchButton
                    listingId={listing.id}
                    watched={listing.is_watched}
                    className="absolute top-2 right-2"
                />
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <div className="flex items-center justify-between">
                    <span className="font-semibold">
                        {formatCents(priceCents)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                        {conditionLabel(listing.condition)}
                    </Badge>
                </div>

                {isAuction && listing.auction && (
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="size-3" />{' '}
                        {timeRemaining(listing.auction.ends_at)} left
                    </p>
                )}

                {listing.shop && (
                    <p className="text-muted-foreground mt-auto flex items-center gap-1 pt-1 text-xs">
                        <span className="truncate">{listing.shop.name}</span>
                        {listing.shop.ratings_count > 0 && (
                            <span className="flex items-center gap-0.5">
                                ·{' '}
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                {Number(listing.shop.rating_avg).toFixed(1)}
                            </span>
                        )}
                    </p>
                )}
            </div>
        </Link>
    );
}
