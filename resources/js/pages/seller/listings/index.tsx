import { Head, Link, router } from '@inertiajs/react';
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCents } from '@/lib/format';
import { dashboard } from '@/routes';
import { apply as sellerApply } from '@/routes/seller';
import {
    create,
    destroy,
    edit,
    index as listingsIndex,
} from '@/routes/seller/listings';
import { show as showListing } from '@/routes/listings';
import type { Listing, Shop } from '@/types';

type Props = {
    shop: Shop | null;
    listings: Listing[];
};

const STATUS_TONE: Record<string, string> = {
    active: 'text-emerald-600',
    draft: 'text-muted-foreground',
    ended: 'text-amber-600',
    sold: 'text-blue-600',
};

export default function SellerListings({ shop, listings }: Props) {
    if (!shop) {
        return (
            <>
                <Head title="My listings" />
                <EmptyState
                    title="Open a shop to start selling"
                    body="You need a verified shop before you can list items."
                    action={
                        <Button asChild>
                            <Link href={sellerApply()}>Become a seller</Link>
                        </Button>
                    }
                />
            </>
        );
    }

    return (
        <>
            <Head title="My listings" />
            <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">My listings</h1>
                    {shop.status === 'verified' && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" /> New listing
                            </Link>
                        </Button>
                    )}
                </div>

                {shop.status !== 'verified' && (
                    <Card>
                        <CardContent className="text-muted-foreground pt-6 text-sm">
                            Your shop is <strong>{shop.status}</strong>. You can
                            list items once an admin verifies it.
                        </CardContent>
                    </Card>
                )}

                {listings.length === 0 ? (
                    <EmptyState
                        title="No listings yet"
                        body="Create your first listing to appear in the marketplace."
                    />
                ) : (
                    <div className="space-y-3">
                        {listings.map((listing) => (
                            <Card key={listing.id}>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-md">
                                        {listing.images?.[0] ? (
                                            <img
                                                src={listing.images[0].url}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground flex size-full items-center justify-center">
                                                <ImageOff className="size-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={showListing(listing.id).url}
                                            className="truncate font-medium hover:underline"
                                        >
                                            {listing.title}
                                        </Link>
                                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    STATUS_TONE[listing.status]
                                                }
                                            >
                                                {listing.status}
                                            </Badge>
                                            <span>
                                                {listing.type === 'auction'
                                                    ? 'Auction'
                                                    : 'Buy now'}
                                            </span>
                                            <span>
                                                {formatCents(
                                                    listing.type === 'auction'
                                                        ? (listing.auction
                                                              ?.current_bid_cents ??
                                                              listing.auction
                                                                  ?.starting_bid_cents ??
                                                              null)
                                                        : listing.price_cents,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <Link href={edit(listing.id)}>
                                                <Pencil className="size-4" />
                                            </Link>
                                        </Button>
                                        {listing.status !== 'sold' && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Delete this listing?',
                                                        )
                                                    ) {
                                                        router.delete(
                                                            destroy(listing.id)
                                                                .url,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function EmptyState({
    title,
    body,
    action,
}: {
    title: string;
    body: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-dashed p-10 text-center">
            <h2 className="font-medium">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

SellerListings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'My listings', href: listingsIndex() },
    ],
};
