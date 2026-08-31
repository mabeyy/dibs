import { Head, router } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { browse } from '@/routes';
import type { Listing, SelectOption, SubcategoryMap } from '@/types';

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Filters = {
    q: string;
    category: string;
    subcategory: string;
    condition: string;
    type: string;
    min_price: string;
    max_price: string;
    min_rating: string;
    sort: string;
};

type Props = {
    listings: Paginated<Listing>;
    filters: Filters;
    categories: SelectOption[];
    subcategories: SubcategoryMap;
    conditions: SelectOption[];
    types: SelectOption[];
};

const SORTS: SelectOption[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'ending_soon', label: 'Ending soon' },
    { value: 'price_low', label: 'Price: low to high' },
    { value: 'price_high', label: 'Price: high to low' },
];

const RATINGS: SelectOption[] = [
    { value: '4', label: '4★ & up' },
    { value: '3', label: '3★ & up' },
    { value: '2', label: '2★ & up' },
    { value: '1', label: '1★ & up' },
];

export default function Browse({
    listings,
    filters,
    categories,
    subcategories,
    conditions,
    types,
}: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState(filters.min_price);
    const [maxPrice, setMaxPrice] = useState(filters.max_price);

    const applyMany = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== '' && v !== 'newest'),
        );
        router.get(browse().url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const applyFilter = (key: keyof Filters, value: string) => {
        const patch: Partial<Filters> = { [key]: value };
        // Changing category invalidates any subcategory chosen under the old one.
        if (key === 'category') {
            patch.subcategory = '';
        }
        applyMany(patch);
    };

    const clearAll = () => {
        setMinPrice('');
        setMaxPrice('');
        router.get(browse().url, filters.q ? { q: filters.q } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const subcategoryOptions = filters.category
        ? (subcategories[filters.category] ?? [])
        : [];

    const hasActiveFilters =
        filters.category !== '' ||
        filters.subcategory !== '' ||
        filters.condition !== '' ||
        filters.type !== '' ||
        filters.min_price !== '' ||
        filters.max_price !== '' ||
        filters.min_rating !== '';

    return (
        <>
            <Head title="Browse" />

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Filter rail */}
                <aside
                    className={cn(
                        'lg:block lg:w-56 lg:shrink-0',
                        showFilters ? 'block' : 'hidden',
                    )}
                >
                    <div className="space-y-6 lg:sticky lg:top-28">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Filters</h2>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAll}
                                    className="text-muted-foreground hover:text-foreground text-sm"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Hide the category facet once the user is browsing
                            within a category — use Clear all to leave it. */}
                        {filters.category === '' && (
                            <FacetGroup
                                title="Category"
                                options={categories}
                                value={filters.category}
                                onSelect={(v) => applyFilter('category', v)}
                            />
                        )}
                        {subcategoryOptions.length > 0 && (
                            <FacetGroup
                                title="Subcategory"
                                options={subcategoryOptions}
                                value={filters.subcategory}
                                onSelect={(v) => applyFilter('subcategory', v)}
                            />
                        )}
                        <FacetGroup
                            title="Condition"
                            options={conditions}
                            value={filters.condition}
                            onSelect={(v) => applyFilter('condition', v)}
                        />
                        <FacetGroup
                            title="Format"
                            options={types}
                            value={filters.type}
                            onSelect={(v) => applyFilter('type', v)}
                        />

                        <div>
                            <h3 className="mb-2 text-sm font-semibold">
                                Price
                            </h3>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) =>
                                        setMinPrice(e.target.value)
                                    }
                                    className="h-8"
                                />
                                <span className="text-muted-foreground">–</span>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) =>
                                        setMaxPrice(e.target.value)
                                    }
                                    className="h-8"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() =>
                                    applyMany({
                                        min_price: minPrice,
                                        max_price: maxPrice,
                                    })
                                }
                            >
                                Apply
                            </Button>
                        </div>

                        <FacetGroup
                            title="Store rating"
                            options={RATINGS}
                            value={filters.min_rating}
                            onSelect={(v) => applyFilter('min_rating', v)}
                        />
                    </div>
                </aside>

                {/* Results */}
                <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <h1 className="mr-auto text-xl font-semibold">
                            {filters.q
                                ? `Results for "${filters.q}"`
                                : 'Browse'}
                            <span className="text-muted-foreground ml-2 text-sm font-normal">
                                {listings.total}{' '}
                                {listings.total === 1 ? 'item' : 'items'}
                            </span>
                        </h1>

                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setShowFilters((v) => !v)}
                        >
                            <SlidersHorizontal className="size-4" /> Filters
                        </Button>

                        <Select
                            value={filters.sort}
                            onValueChange={(v) => applyFilter('sort', v)}
                        >
                            <SelectTrigger className="w-[170px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORTS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {listings.data.length === 0 ? (
                        <div className="text-muted-foreground rounded-xl border border-dashed py-20 text-center">
                            No items match your filters yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {listings.data.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                />
                            ))}
                        </div>
                    )}

                    {listings.last_page > 1 && (
                        <div className="mt-8 flex flex-wrap justify-center gap-1">
                            {listings.links.map((link, i) => (
                                <Button
                                    key={i}
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function FacetGroup({
    title,
    options,
    value,
    onSelect,
}: {
    title: string;
    options: SelectOption[];
    value: string;
    onSelect: (value: string) => void;
}) {
    return (
        <div>
            <h3 className="mb-2 text-sm font-semibold">{title}</h3>
            <ul className="space-y-0.5 text-sm">
                <FacetItem
                    label="All"
                    active={value === ''}
                    onClick={() => onSelect('')}
                />
                {options.map((option) => (
                    <FacetItem
                        key={option.value}
                        label={option.label}
                        active={value === option.value}
                        onClick={() => onSelect(option.value)}
                    />
                ))}
            </ul>
        </div>
    );
}

function FacetItem({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <li>
            <button
                onClick={onClick}
                className={cn(
                    'hover:bg-accent w-full rounded px-2 py-1 text-left transition',
                    active
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground',
                )}
            >
                {label}
            </button>
        </li>
    );
}
