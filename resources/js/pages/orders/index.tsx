import { Head, Link, router } from '@inertiajs/react';
import { Check, ImageOff, PackageCheck, X } from 'lucide-react';
import { ReviewDialog } from '@/components/review-dialog';
import { ShipDialog } from '@/components/ship-dialog';
import { ShippingAddressDialog } from '@/components/shipping-address-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCents } from '@/lib/format';
import { dashboard } from '@/routes';
import { show as showListing } from '@/routes/listings';
import { cancel, receive } from '@/routes/orders';
import type { Order } from '@/types';

type Props = {
    purchases: Order[];
    sales: Order[];
};

const STATUS_TONE: Record<string, string> = {
    pending: 'text-amber-600',
    shipped: 'text-blue-600',
    completed: 'text-emerald-600',
    cancelled: 'text-muted-foreground',
};

function cancelOrder(orderId: number): void {
    if (confirm('Cancel this order? The item will be relisted.')) {
        router.patch(cancel(orderId).url, {}, { preserveScroll: true });
    }
}

function OrderRow({
    order,
    side,
}: {
    order: Order;
    side: 'purchase' | 'sale';
}) {
    const listing = order.listing;
    const hasAddress = order.ship_line1 !== null;

    return (
        <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-md">
                {listing?.images?.[0] ? (
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
                {listing && (
                    <Link
                        href={showListing(listing.id).url}
                        className="truncate font-medium hover:underline"
                    >
                        {listing.title}
                    </Link>
                )}
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <Badge
                        variant="secondary"
                        className={STATUS_TONE[order.status]}
                    >
                        {order.status}
                    </Badge>
                    <span>{formatCents(order.amount_cents)}</span>
                </div>
                {order.tracking_number && (
                    <p className="text-muted-foreground mt-1 text-xs">
                        {order.shipping_carrier} · {order.tracking_number}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
                {side === 'sale' &&
                    order.status === 'pending' &&
                    (hasAddress ? (
                        <ShipDialog orderId={order.id} />
                    ) : (
                        <span className="text-muted-foreground text-xs">
                            Awaiting buyer address
                        </span>
                    ))}

                {side === 'purchase' &&
                    order.status === 'pending' &&
                    !hasAddress && <ShippingAddressDialog order={order} />}

                {side === 'purchase' && order.status === 'shipped' && (
                    <Button
                        size="sm"
                        onClick={() =>
                            router.patch(
                                receive(order.id).url,
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <PackageCheck className="size-4" /> Confirm received
                    </Button>
                )}

                {side === 'purchase' &&
                    order.status === 'completed' &&
                    order.shop &&
                    (order.review ? (
                        <span className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Check className="size-4" /> Reviewed
                        </span>
                    ) : (
                        <ReviewDialog
                            orderId={order.id}
                            shopName={order.shop.name}
                        />
                    ))}

                {order.status === 'pending' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => cancelOrder(order.id)}
                    >
                        <X className="size-4" />{' '}
                        {side === 'sale' ? 'Decline' : 'Cancel'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Orders({ purchases, sales }: Props) {
    return (
        <>
            <Head title="My cart" />
            <div className="mx-auto w-full max-w-3xl space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchases</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {purchases.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                You haven't bought anything yet.
                            </p>
                        ) : (
                            purchases.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    side="purchase"
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                {sales.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sales.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    side="sale"
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Orders.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'My cart', href: '/orders' },
    ],
};
