import { useForm } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import {
    emptyShipping,
    ShippingAddressFields,
    type ShippingValues,
} from '@/components/shipping-address-fields';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { formatCents } from '@/lib/format';
import { store as buyListing } from '@/routes/orders';

type Props = {
    listingId: number;
    priceCents: number | null;
};

export function CheckoutDialog({ listingId, priceCents }: Props) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } =
        useForm<ShippingValues>(emptyShipping);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(buyListing(listingId).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                    <ShoppingBag className="size-4" /> Buy now
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Shipping details</DialogTitle>
                    <DialogDescription>
                        Where should the shop send this item?
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <ShippingAddressFields
                        values={data}
                        onChange={(field, value) => setData(field, value)}
                        errors={errors}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Confirm purchase · {formatCents(priceCents)}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
