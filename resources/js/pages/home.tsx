import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Gavel, Sparkles } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { browse } from '@/routes';
import type { Listing } from '@/types';

type Props = {
    endingSoon: Listing[];
    fresh: Listing[];
};

const CATEGORIES = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'bags', label: 'Bags' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'watches', label: 'Watches' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'jewelry', label: 'Jewelry' },
];

export default function Home({ endingSoon, fresh }: Props) {
    return (
        <>
            <Head title="Second-hand fashion, watches & bags" />

            {/* Hero */}
            <section className="from-primary/10 mb-10 rounded-2xl bg-gradient-to-br to-transparent p-8 sm:p-12">
                <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
                    Buy and bid on pre-loved fashion from real, reviewed shops.
                </h1>
                <p className="text-muted-foreground mt-3 max-w-xl">
                    Dibs brings second-hand clothing, watches and bags out of
                    the group chats and into one trusted marketplace — with
                    auctions and shop ratings you can rely on.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="lg">
                        <Link href={browse()}>
                            Start browsing <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    {CATEGORIES.map((category) => (
                        <Button
                            key={category.value}
                            asChild
                            variant="outline"
                            size="lg"
                        >
                            <Link
                                href={
                                    browse({
                                        query: { category: category.value },
                                    }).url
                                }
                            >
                                {category.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </section>

            {endingSoon.length > 0 && (
                <Section
                    title="Ending soon"
                    icon={<Gavel className="size-5" />}
                    href={
                        browse({
                            query: { type: 'auction', sort: 'ending_soon' },
                        }).url
                    }
                    listings={endingSoon}
                />
            )}

            <Section
                title="Fresh listings"
                icon={<Sparkles className="size-5" />}
                href={browse().url}
                listings={fresh}
            />
        </>
    );
}

function Section({
    title,
    icon,
    href,
    listings,
}: {
    title: string;
    icon: React.ReactNode;
    href: string;
    listings: Listing[];
}) {
    return (
        <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    {icon} {title}
                </h2>
                <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                >
                    View all <ArrowRight className="size-3.5" />
                </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </section>
    );
}
