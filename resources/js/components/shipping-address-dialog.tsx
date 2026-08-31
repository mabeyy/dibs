import { useForm } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import {
    emptyShipping,
    ShippingAddressFields,
    shippingFrom,
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
import { update as updateAddress } from '@/routes/orders/address';
import type { Order } from '@/types';

/**
 * Lets an auction winner (or any buyer) supply/update the shipping address
 * for an order that doesn't have one yet.
 */
export function ShippingAddressDialog({ order }: { order: Order }) {
    const [open, setOpen] = useState(false);
    const { data, setData, patch, processing, errors } =
        useForm<ShippingValues>(
            order.ship_line1 ? shippingFrom(order) : emptyShipping,
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(updateAddress(order.id).url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <MapPin className="size-4" /> Add shipping address
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Shipping address</DialogTitle>
                    <DialogDescription>
                        Tell the shop where to send your item.
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
                            Save address
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
