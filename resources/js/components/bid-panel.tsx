import { Link, router, useForm } from '@inertiajs/react';
import { Clock, Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { formatCents, timeRemaining } from '@/lib/format';
import { login } from '@/routes';
import { store as placeBid } from '@/routes/bids';
import type { Listing } from '@/types';

export function BidPanel({
    listing,
    canBid,
}: {
    listing: Listing;
    canBid: boolean;
}) {
    const auction = listing.auction!;
    const [remaining, setRemaining] = useState(() =>
        timeRemaining(auction.ends_at),
    );
    const ended = remaining === 'Ended' || listing.status !== 'active';

    const minNextCents =
        auction.minimum_next_bid_cents ?? auction.starting_bid_cents;

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
    });

    // Live countdown.
    useEffect(() => {
        const tick = setInterval(
            () => setRemaining(timeRemaining(auction.ends_at)),
            1000,
        );
        return () => clearInterval(tick);
    }, [auction.ends_at]);

    // Poll for new bids from other users while the auction is live.
    useEffect(() => {
        if (ended) {
            return;
        }
        const poll = setInterval(() => {
            router.reload({ only: ['listing'] });
        }, 5000);
        return () => clearInterval(poll);
    }, [ended]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(placeBid(listing.id).url, {
            preserveScroll: true,
            onSuccess: () => reset('amount'),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                    <Gavel className="size-4" /> {auction.bid_count ?? 0} bids
                </span>
                <span
                    className={
                        ended
                            ? 'text-muted-foreground'
                            : 'flex items-center gap-1 font-medium text-red-600'
                    }
                >
                    <Clock className="size-4" />{' '}
                    {ended ? 'Auction ended' : `${remaining} left`}
                </span>
            </div>

            {ended ? (
                <div className="bg-muted rounded-md p-3 text-center text-sm">
                    This auction has ended.
                </div>
            ) : canBid ? (
                <form onSubmit={submit} className="space-y-2">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                                $
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                min={minNextCents / 100}
                                value={data.amount}
                                onChange={(e) =>
                                    setData('amount', e.target.value)
                                }
                                placeholder={(minNextCents / 100).toFixed(2)}
                                className="pl-7"
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Place bid
                        </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Enter {formatCents(minNextCents)} or more
                    </p>
                    <InputError message={errors.amount} />
                </form>
            ) : (
                <Button asChild className="w-full" variant="outline">
                    <Link href={login()}>Log in to bid</Link>
                </Button>
            )}
        </div>
    );
}
