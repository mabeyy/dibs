import { Head, useForm } from '@inertiajs/react';
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
import { index as listingsIndex, store } from '@/routes/seller/listings';
import type { SelectOption, SubcategoryMap } from '@/types';

type Props = {
    categories: SelectOption[];
    subcategories: SubcategoryMap;
    conditions: SelectOption[];
    types: SelectOption[];
};

export default function CreateListing({
    categories,
    subcategories,
    conditions,
    types,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        category: string;
        subcategory: string;
        type: string;
        title: string;
        description: string;
        brand: string;
        size: string;
        condition: string;
        price: string;
        starting_bid: string;
        reserve_price: string;
        duration_days: string;
        images: File[];
    }>({
        category: '',
        subcategory: '',
        type: 'fixed',
        title: '',
        description: '',
        brand: '',
        size: '',
        condition: '',
        price: '',
        starting_bid: '',
        reserve_price: '',
        duration_days: '7',
        images: [],
    });

    const isAuction = data.type === 'auction';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, { forceFormData: true });
    };

    return (
        <>
            <Head title="New listing" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>List an item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-2">
                                <Label>Selling format</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(v) => setData('type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. Vintage Levi's 501 jacket"
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
                                                category: v,
                                                subcategory: '',
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose" />
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
                                            <SelectValue
                                                placeholder={
                                                    data.category
                                                        ? 'Choose'
                                                        : 'Pick a category first'
                                                }
                                            />
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
                                        setData('condition', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose" />
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
                                    <Label htmlFor="brand">
                                        Brand (optional)
                                    </Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) =>
                                            setData('brand', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="size">
                                        Size (optional)
                                    </Label>
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
                                    placeholder="Condition details, measurements, flaws…"
                                />
                                <InputError message={errors.description} />
                            </div>

                            {isAuction ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="starting_bid">
                                            Starting bid ($)
                                        </Label>
                                        <Input
                                            id="starting_bid"
                                            type="number"
                                            step="0.01"
                                            value={data.starting_bid}
                                            onChange={(e) =>
                                                setData(
                                                    'starting_bid',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.starting_bid}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reserve_price">
                                            Reserve ($)
                                        </Label>
                                        <Input
                                            id="reserve_price"
                                            type="number"
                                            step="0.01"
                                            value={data.reserve_price}
                                            onChange={(e) =>
                                                setData(
                                                    'reserve_price',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.reserve_price}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_days">
                                            Days
                                        </Label>
                                        <Input
                                            id="duration_days"
                                            type="number"
                                            min={1}
                                            max={14}
                                            value={data.duration_days}
                                            onChange={(e) =>
                                                setData(
                                                    'duration_days',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.duration_days}
                                        />
                                    </div>
                                </div>
                            ) : (
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

                            <div className="grid gap-2">
                                <Label htmlFor="images">Photos (up to 8)</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) =>
                                        setData(
                                            'images',
                                            Array.from(e.target.files ?? []),
                                        )
                                    }
                                />
                                <InputError message={errors.images} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Publish listing
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateListing.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'My listings', href: listingsIndex() },
        { title: 'New listing', href: '/sell/listings/create' },
    ],
};
