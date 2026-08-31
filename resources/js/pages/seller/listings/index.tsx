import { Head, Link, router } from '@inertiajs/react';
import {
    ImageOff,
    LayoutGrid,
    List as ListIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { conditionLabel, formatCents } from '@/lib/format';
import { cn } from '@/lib/utils';
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

const STATUS_ORDER = ['active', 'draft', 'ended', 'sold'] as const;

type StatusFilter = 'all' | (typeof STATUS_ORDER)[number];
type SortKey = 'newest' | 'price_high' | 'price_low' | 'title';
type ViewMode = 'list' | 'grid';

const VIEW_STORAGE_KEY = 'dibs.seller.listings.view';

const SORTS: { value: SortKey; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_high', label: 'Price: high to low' },
    { value: 'price_low', label: 'Price: low to high' },
    { value: 'title', label: 'Title A–Z' },
];

function deleteListing(listing: Listing): void {
    if (confirm('Delete this listing?')) {
        router.delete(destroy(listing.id).url, { preserveScroll: true });
    }
}

/** The comparable price for a listing (auction current/starting bid, else fixed price). */
function priceOf(listing: Listing): number {
    if (listing.type === 'auction') {
        return (
            listing.auction?.current_bid_cents ??
            listing.auction?.starting_bid_cents ??
            0
        );
    }
    return listing.price_cents ?? 0;
}

export default function SellerListings({ shop, listings }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [category, setCategory] = useState('all');
    const [type, setType] = useState('all');
    const [sort, setSort] = useState<SortKey>('newest');
    const [view, setView] = useState<ViewMode>(() => {
        if (typeof window === 'undefined') {
            return 'grid';
        }
        return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'list'
            ? 'list'
            : 'grid';
    });

    useEffect(() => {
        window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    }, [view]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: listings.length };
        for (const listing of listings) {
            counts[listing.status] = (counts[listing.status] ?? 0) + 1;
        }
        return counts;
    }, [listings]);

    // Only offer categories the seller actually has, using their display labels.
    const categoryOptions = useMemo(() => {
        const map = new Map<string, string>();
        for (const listing of listings) {
            map.set(
                listing.category,
                listing.category_label ?? listing.category,
            );
        }
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [listings]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        const result = listings.filter((listing) => {
            if (status !== 'all' && listing.status !== status) {
                return false;
            }
            if (category !== 'all' && listing.category !== category) {
                return false;
            }
            if (type !== 'all' && listing.type !== type) {
                return false;
            }
            if (query) {
                const haystack = [
                    listing.title,
                    listing.brand,
                    listing.category_label,
                    listing.subcategory_label,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(query)) {
                    return false;
                }
            }
            return true;
        });

        const sorted = [...result];
        if (sort === 'price_high') {
            sorted.sort((a, b) => priceOf(b) - priceOf(a));
        } else if (sort === 'price_low') {
            sorted.sort((a, b) => priceOf(a) - priceOf(b));
        } else if (sort === 'title') {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
        // 'newest' keeps the server order (already latest-first).
        return sorted;
    }, [listings, search, status, category, type, sort]);

    const hasActiveFilters =
        search.trim() !== '' ||
        status !== 'all' ||
        category !== 'all' ||
        type !== 'all';

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        setType('all');
    };

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
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">My listings</h1>
                        <p className="text-muted-foreground text-sm">
                            {listings.length}{' '}
                            {listings.length === 1 ? 'item' : 'items'} in{' '}
                            {shop.name}
                        </p>
                    </div>
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
                    <>
                        {/* Status overview — click a tab to filter */}
                        <div className="flex flex-wrap gap-2">
                            <StatusTab
                                label="All"
                                count={statusCounts.all ?? 0}
                                active={status === 'all'}
                                onClick={() => setStatus('all')}
                            />
                            {STATUS_ORDER.map((s) => (
                                <StatusTab
                                    key={s}
                                    label={s}
                                    count={statusCounts[s] ?? 0}
                                    tone={STATUS_TONE[s]}
                                    active={status === s}
                                    onClick={() => setStatus(s)}
                                />
                            ))}
                        </div>

                        {/* Search + filters */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search your listings by title, brand…"
                                    className="pl-9"
                                />
                            </div>
                            {categoryOptions.length > 1 && (
                                <Select
                                    value={category}
                                    onValueChange={setCategory}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All categories
                                        </SelectItem>
                                        {categoryOptions.map((c) => (
                                            <SelectItem
                                                key={c.value}
                                                value={c.value}
                                            >
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-full sm:w-[130px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                        Buy now
                                    </SelectItem>
                                    <SelectItem value="auction">
                                        Auction
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={sort}
                                onValueChange={(v) => setSort(v as SortKey)}
                            >
                                <SelectTrigger className="w-full sm:w-[170px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORTS.map((s) => (
                                        <SelectItem
                                            key={s.value}
                                            value={s.value}
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <span>
                                    Showing {filtered.length} of{' '}
                                    {listings.length}
                                </span>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="hover:text-foreground flex items-center gap-1"
                                    >
                                        <X className="size-3.5" /> Clear filters
                                    </button>
                                )}
                            </div>
                            <ViewToggle view={view} onChange={setView} />
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
                                No listings match your search or filters.
                            </div>
                        ) : view === 'grid' ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {filtered.map((listing) => (
                                    <ListingGridCard
                                        key={listing.id}
                                        listing={listing}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map((listing) => (
                                    <ListingRow
                                        key={listing.id}
                                        listing={listing}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function StatusTab({
    label,
    count,
    tone,
    active,
    onClick,
}: {
    label: string;
    count: number;
    tone?: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition',
                active
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'hover:bg-accent text-muted-foreground',
            )}
        >
            <span className={cn(!active && tone)}>{label}</span>
            <span
                className={cn(
                    'rounded-full px-1.5 text-xs',
                    active
                        ? 'bg-primary/15 text-foreground'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                {count}
            </span>
        </button>
    );
}

function ListingRow({ listing }: { listing: Listing }) {
    const meta = [
        listing.category_label,
        listing.subcategory_label,
        conditionLabel(listing.condition),
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <Card>
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
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {meta}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                        <Badge
                            variant="secondary"
                            className={cn(
                                'capitalize',
                                STATUS_TONE[listing.status],
                            )}
                        >
                            {listing.status}
                        </Badge>
                        <Badge variant="outline">
                            {listing.type === 'auction' ? 'Auction' : 'Buy now'}
                        </Badge>
                        <span className="font-medium">
                            {formatCents(priceOf(listing))}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button asChild size="icon" variant="ghost" title="Edit">
                        <Link href={edit(listing.id)}>
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                    {listing.status !== 'sold' && (
                        <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() => deleteListing(listing)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ViewToggle({
    view,
    onChange,
}: {
    view: ViewMode;
    onChange: (view: ViewMode) => void;
}) {
    return (
        <div className="flex items-center rounded-md border p-0.5">
            <button
                onClick={() => onChange('list')}
                title="List view"
                aria-pressed={view === 'list'}
                className={cn(
                    'rounded p-1.5 transition',
                    view === 'list'
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                )}
            >
                <ListIcon className="size-4" />
            </button>
            <button
                onClick={() => onChange('grid')}
                title="Card view"
                aria-pressed={view === 'grid'}
                className={cn(
                    'rounded p-1.5 transition',
                    view === 'grid'
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                )}
            >
                <LayoutGrid className="size-4" />
            </button>
        </div>
    );
}

function ListingGridCard({ listing }: { listing: Listing }) {
    const meta = [listing.category_label, listing.subcategory_label]
        .filter(Boolean)
        .join(' · ');

    return (
        <Card className="group gap-3 overflow-hidden pt-0">
            <Link
                href={showListing(listing.id).url}
                className="bg-muted relative block aspect-square overflow-hidden"
            >
                {listing.images?.[0] ? (
                    <img
                        src={listing.images[0].url}
                        alt=""
                        className="size-full object-cover transition group-hover:scale-105"
                    />
                ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                        <ImageOff className="size-8" />
                    </div>
                )}
                <Badge
                    variant="secondary"
                    className={cn(
                        'absolute top-2 left-2 capitalize',
                        STATUS_TONE[listing.status],
                    )}
                >
                    {listing.status}
                </Badge>
            </Link>
            <CardContent className="space-y-2 px-3 pb-3">
                <div>
                    <Link
                        href={showListing(listing.id).url}
                        className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                        {listing.title}
                    </Link>
                    <p className="text-muted-foreground truncate text-xs">
                        {meta}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                        {formatCents(priceOf(listing))}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            title="Edit"
                        >
                            <Link href={edit(listing.id)}>
                                <Pencil className="size-4" />
                            </Link>
                        </Button>
                        {listing.status !== 'sold' && (
                            <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                onClick={() => deleteListing(listing)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
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
