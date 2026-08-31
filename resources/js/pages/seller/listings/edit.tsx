import { Head, router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import { index as listingsIndex, update } from '@/routes/seller/listings';
import {
    destroy as destroyImage,
    store as storeImage,
} from '@/routes/seller/listings/images';
import type { Listing, SelectOption, SubcategoryMap } from '@/types';

type Props = {
    listing: Listing;
    categories: SelectOption[];
    subcategories: SubcategoryMap;
    conditions: SelectOption[];
};

export default function EditListing({
    listing,
    categories,
    subcategories,
    conditions,
}: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const isAuction = listing.type === 'auction';

    const { data, setData, patch, processing, errors } = useForm({
        category: listing.category,
        subcategory: (listing.subcategory ?? '') as string,
        title: listing.title,
        description: listing.description ?? '',
        brand: listing.brand ?? '',
        size: listing.size ?? '',
        condition: listing.condition,
        price: listing.price_cents
            ? (listing.price_cents / 100).toString()
            : '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(update(listing.id).url);
    };

    const addImages = (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }
        router.post(
            storeImage(listing.id).url,
            { images: Array.from(files) },
            { forceFormData: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`Edit · ${listing.title}`} />
            <div className="mx-auto w-full max-w-2xl space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit listing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(v) =>
                                            setData((prev) => ({
                                                ...prev,
                                                category:
                                                    v as Listing['category'],
                                                subcategory: '',
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem
                                                    key={c.value}
                                                    value={c.value}
                                                >
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Subcategory</Label>
                                    <Select
                                        value={data.subcategory}
                                        onValueChange={(v) =>
                                            setData('subcategory', v)
                                        }
                                        disabled={!data.category}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(
                                                subcategories[data.category] ??
                                                []
                                            ).map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.subcategory} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Condition</Label>
                                <Select
                                    value={data.condition}
                                    onValueChange={(v) =>
                                        setData(
                                            'condition',
                                            v as Listing['condition'],
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditions.map((c) => (
                                            <SelectItem
                                                key={c.value}
                                                value={c.value}
                                            >
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.condition} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) =>
                                            setData('brand', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="size">Size</Label>
                                    <Input
                                        id="size"
                                        value={data.size}
                                        onChange={(e) =>
                                            setData('size', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                            </div>

                            {!isAuction && (
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.price} />
                                </div>
                            )}

                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Photos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            {(listing.images ?? []).map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative size-24 overflow-hidden rounded-md border"
                                >
                                    <img
                                        src={image.url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                destroyImage([
                                                    listing.id,
                                                    image.id,
                                                ]).url,
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                            {(listing.images?.length ?? 0) === 0 && (
                                <p className="text-muted-foreground text-sm">
                                    No photos yet.
                                </p>
                            )}
                        </div>
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => addImages(e.target.files)}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInput.current?.click()}
                        >
                            Add photos
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditListing.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'My listings', href: listingsIndex() },
        { title: 'Edit', href: '#' },
    ],
};
