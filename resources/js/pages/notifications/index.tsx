import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    Gavel,
    MessageCircle,
    ShoppingBag,
    Trophy,
    Truck,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as showListing } from '@/routes/listings';
import { index as messagesIndex } from '@/routes/messages';
import { readAll } from '@/routes/notifications';
import { index as ordersIndex } from '@/routes/orders';
import type { AppNotification } from '@/types';

type Props = {
    notifications: AppNotification[];
};

const ICONS: Record<string, typeof Bell> = {
    new_message: MessageCircle,
    new_sale: ShoppingBag,
    order_shipped: Truck,
    order_cancelled: X,
    outbid: Gavel,
    auction_won: Trophy,
    auction_ended: Gavel,
};

function hrefFor(notification: AppNotification): string {
    if (notification.conversation_id) {
        return `/messages/${notification.conversation_id}`;
    }
    if (notification.order_id) {
        return ordersIndex().url;
    }
    if (notification.listing_id) {
        return showListing(notification.listing_id).url;
    }
    return messagesIndex().url;
}

export default function NotificationsIndex({ notifications }: Props) {
    const hasUnread = notifications.some((n) => n.read_at === null);

    return (
        <>
            <Head title="Notifications" />
            <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Notifications</h1>
                    {hasUnread && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                router.patch(
                                    readAll().url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCheck className="size-4" /> Mark all read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
                        You're all caught up.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notification) => {
                            const Icon = ICONS[notification.type] ?? Bell;
                            const unread = notification.read_at === null;
                            return (
                                <Link
                                    key={notification.id}
                                    href={hrefFor(notification)}
                                    className="block"
                                >
                                    <Card
                                        className={cn(
                                            'hover:bg-accent transition',
                                            unread && 'border-primary/40',
                                        )}
                                    >
                                        <CardContent className="flex items-center gap-3 p-4">
                                            <div
                                                className={cn(
                                                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                                                    unread
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </div>
                                            <p
                                                className={cn(
                                                    'min-w-0 flex-1 text-sm',
                                                    !unread &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                {notification.message}
                                            </p>
                                            {unread && (
                                                <span className="bg-primary size-2 shrink-0 rounded-full" />
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Notifications', href: '/notifications' },
    ],
};
