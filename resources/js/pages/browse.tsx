import { Head, router } from '@inertiajs/react';
import { ListingCard } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { browse } from '@/routes';
import type { Listing, SelectOption } from '@/types';

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Filters = {
    q: string;
    category: string;
    condition: string;
    type: string;
    sort: string;
};

type Props = {
    listings: Paginated<Listing>;
    filters: Filters;
    categories: SelectOption[];
    conditions: SelectOption[];
    types: SelectOption[];
};

const SORTS: SelectOption[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'ending_soon', label: 'Ending soon' },
    { value: 'price_low', label: 'Price: low to high' },
    { value: 'price_high', label: 'Price: high to low' },
];

const ANY = 'any';

export default function Browse({
    listings,
    filters,
    categories,
    conditions,
    types,
}: Props) {
    const applyFilter = (key: keyof Filters, value: string) => {
        const next = { ...filters, [key]: value === ANY ? '' : value };
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== '' && v !== 'newest'),
        );
        router.get(browse().url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Browse" />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <h1 className="mr-auto text-xl font-semibold">
                    {filters.q ? `Results for "${filters.q}"` : 'Browse'}
                </h1>

                <FilterSelect
                    value={filters.category || ANY}
                    onChange={(v) => applyFilter('category', v)}
                    placeholder="Category"
                    options={categories}
                />
                <FilterSelect
                    value={filters.condition || ANY}
                    onChange={(v) => applyFilter('condition', v)}
                    placeholder="Condition"
                    options={conditions}
                />
                <FilterSelect
                    value={filters.type || ANY}
                    onChange={(v) => applyFilter('type', v)}
                    placeholder="Type"
                    options={types}
                />
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {listings.data.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}

            {listings.last_page > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-1">
                    {listings.links.map((link, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant={link.active ? 'default' : 'outline'}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function FilterSelect({
    value,
    onChange,
    placeholder,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: SelectOption[];
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ANY}>{placeholder}: any</SelectItem>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
