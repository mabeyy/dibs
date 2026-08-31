import { Head } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { RatingStars } from '@/components/rating-stars';
import type { Listing, ShopReview } from '@/types';

type ShopSummary = {
    id: number;
    name: string;
    slug: string;
    bio: string | null;
    rating_avg: number;
    ratings_count: number;
};

type Props = {
    shop: ShopSummary;
    listings: Listing[];
    reviews: ShopReview[];
};

export default function ShopShow({ shop, listings, reviews }: Props) {
    return (
        <>
            <Head title={shop.name} />

            <div className="mb-8 flex items-start gap-4">
                <div className="bg-muted flex size-16 items-center justify-center rounded-xl">
                    <Store className="size-7" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">{shop.name}</h1>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                        {shop.ratings_count > 0 ? (
                            <>
                                <RatingStars rating={Number(shop.rating_avg)} />
                                <span>
                                    {Number(shop.rating_avg).toFixed(1)} ·{' '}
                                    {shop.ratings_count} review
                                    {shop.ratings_count === 1 ? '' : 's'}
                                </span>
                            </>
                        ) : (
                            <span>No reviews yet</span>
                        )}
                    </div>
                    {shop.bio && (
                        <p className="text-muted-foreground mt-2 max-w-prose text-sm">
                            {shop.bio}
                        </p>
                    )}
                </div>
            </div>

            <section className="mb-10">
                <h2 className="mb-3 text-lg font-medium">
                    {listings.length} item{listings.length === 1 ? '' : 's'} for
                    sale
                </h2>
                {listings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Nothing listed right now.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-3 text-lg font-medium">Reviews</h2>
                {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        This shop has no reviews yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {review.buyer?.name ?? 'Buyer'}
                                    </span>
                                    <RatingStars rating={review.rating} />
                                </div>
                                {review.body && (
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        {review.body}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
