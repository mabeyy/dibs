import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { browse, dashboard } from '@/routes';
import type { Listing } from '@/types';

type Props = {
    listings: Listing[];
};

export default function Watchlist({ listings }: Props) {
    return (
        <>
            <Head title="Watchlist" />
            <div className="mx-auto w-full max-w-4xl p-4">
                <h1 className="mb-4 text-xl font-semibold">Watchlist</h1>

                {listings.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center">
                        <Heart className="text-muted-foreground mx-auto size-8" />
                        <p className="mt-3 font-medium">Nothing saved yet</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Tap the heart on any item to keep an eye on it.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={browse()}>Browse items</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Watchlist.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Watchlist', href: '/watchlist' },
    ],
};
