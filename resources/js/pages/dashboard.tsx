import { Head, Link } from '@inertiajs/react';
import { Heart, PackageSearch, Receipt, Store, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { browse, dashboard } from '@/routes';
import { index as ordersIndex } from '@/routes/orders';
import { apply as sellerApply } from '@/routes/seller';
import { index as sellerListings } from '@/routes/seller/listings';
import { index as watchlistIndex } from '@/routes/watchlist';

const TILES = [
    {
        title: 'Browse the marketplace',
        description: 'Clothing, watches and bags',
        href: browse().url,
        icon: PackageSearch,
    },
    {
        title: 'Watchlist',
        description: 'Items you are keeping an eye on',
        href: watchlistIndex().url,
        icon: Heart,
    },
    {
        title: 'Orders',
        description: 'Your purchases and sales',
        href: ordersIndex().url,
        icon: Receipt,
    },
    {
        title: 'My listings',
        description: 'Manage what you sell',
        href: sellerListings().url,
        icon: Tag,
    },
    {
        title: 'Become a seller',
        description: 'Open your own shop',
        href: sellerApply().url,
        icon: Store,
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-4xl p-4">
                <h1 className="mb-4 text-xl font-semibold">Welcome to Dibs</h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {TILES.map((tile) => {
                        const Icon = tile.icon;
                        return (
                            <Link key={tile.title} href={tile.href}>
                                <Card className="hover:border-primary/50 h-full transition">
                                    <CardContent className="flex items-start gap-3 pt-6">
                                        <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {tile.title}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {tile.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
