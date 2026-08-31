import { Head, Link } from '@inertiajs/react';
import { ImageOff, Star } from 'lucide-react';
import { useState } from 'react';
import { BidPanel } from '@/components/bid-panel';
import { CheckoutDialog } from '@/components/checkout-dialog';
import { ContactShopDialog } from '@/components/contact-shop-dialog';
import { WatchButton } from '@/components/watch-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { conditionLabel, formatCents, titleCase } from '@/lib/format';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import type { Listing } from '@/types';

type Props = {
    listing: Listing;
    canBid: boolean;
};

export default function ListingShow({ listing, canBid }: Props) {
    const images = listing.images ?? [];
    const [active, setActive] = useState(0);
    const isAuction = listing.type === 'auction';
    const priceCents = isAuction
        ? (listing.auction?.current_bid_cents ??
          listing.auction?.starting_bid_cents ??
          null)
        : listing.price_cents;

    return (
        <>
            <Head title={listing.title} />

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Gallery */}
                <div className="space-y-3">
                    <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
                        {images[active] ? (
                            <img
                                src={images[active].url}
                                alt={listing.title}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="text-muted-foreground flex size-full items-center justify-center">
                                <ImageOff className="size-10" />
                            </div>
                        )}
                        <WatchButton
                            listingId={listing.id}
                            watched={listing.is_watched}
                            className="absolute top-3 right-3 size-10"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2">
                            {images.map((image, i) => (
                                <button
                                    key={image.id}
                                    onClick={() => setActive(i)}
                                    className={cn(
                                        'bg-muted size-16 overflow-hidden rounded-md border-2',
                                        i === active
                                            ? 'border-primary'
                                            : 'border-transparent',
                                    )}
                                >
                                    <img
                                        src={image.url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-5">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="secondary">
                                {listing.category_label ??
                                    titleCase(listing.category)}
                            </Badge>
                            {listing.subcategory_label && (
                                <Badge variant="outline">
                                    {listing.subcategory_label}
                                </Badge>
                            )}
                            {isAuction ? (
                                <Badge>Auction</Badge>
                            ) : (
                                <Badge variant="outline">Buy now</Badge>
                            )}
                        </div>
                        <h1 className="text-2xl font-semibold">
                            {listing.title}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {[
                                listing.brand,
                                listing.size ? `Size ${listing.size}` : null,
                                conditionLabel(listing.condition),
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </div>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">
                                    {isAuction ? 'Current bid' : 'Price'}
                                </p>
                                <p className="text-3xl font-bold">
                                    {formatCents(priceCents)}
                                </p>
                            </div>

                            {isAuction ? (
                                <BidPanel listing={listing} canBid={canBid} />
                            ) : listing.status === 'sold' ? (
                                <Badge variant="secondary" className="text-sm">
                                    Sold
                                </Badge>
                            ) : canBid ? (
                                <CheckoutDialog
                                    listingId={listing.id}
                                    priceCents={priceCents}
                                />
                            ) : (
                                <Button
                                    asChild
                                    className="w-full"
                                    size="lg"
                                    variant="outline"
                                >
                                    <Link href={login()}>Log in to buy</Link>
                                </Button>
                            )}

                            {canBid && listing.shop && (
                                <ContactShopDialog
                                    listingId={listing.id}
                                    shopName={listing.shop.name}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {listing.description && (
                        <div>
                            <h2 className="mb-1 font-medium">Description</h2>
                            <p className="text-muted-foreground text-sm whitespace-pre-line">
                                {listing.description}
                            </p>
                        </div>
                    )}

                    {listing.shop && (
                        <Link
                            href={`/shops/${listing.shop.slug}`}
                            className="hover:bg-accent flex items-center justify-between rounded-lg border p-4"
                        >
                            <div>
                                <p className="text-muted-foreground text-xs">
                                    Sold by
                                </p>
                                <p className="font-medium">
                                    {listing.shop.name}
                                </p>
                            </div>
                            {listing.shop.ratings_count > 0 ? (
                                <span className="flex items-center gap-1 text-sm">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    {Number(listing.shop.rating_avg).toFixed(1)}
                                    <span className="text-muted-foreground">
                                        ({listing.shop.ratings_count})
                                    </span>
                                </span>
                            ) : (
                                <span className="text-muted-foreground text-sm">
                                    No reviews yet
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
