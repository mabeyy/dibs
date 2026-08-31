import { useForm } from '@inertiajs/react';
import { Truck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ship } from '@/routes/orders';

export function ShipDialog({ orderId }: { orderId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, patch, processing, errors, reset } = useForm({
        shipping_carrier: '',
        tracking_number: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(ship(orderId).url, {
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
                <Button size="sm">
                    <Truck className="size-4" /> Mark shipped
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Shipment details</DialogTitle>
                    <DialogDescription>
                        Add the carrier and tracking number so the buyer can
                        follow their parcel.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="shipping_carrier">Carrier</Label>
                        <Input
                            id="shipping_carrier"
                            value={data.shipping_carrier}
                            onChange={(e) =>
                                setData('shipping_carrier', e.target.value)
                            }
                            placeholder="e.g. USPS, UPS, DHL"
                        />
                        <InputError message={errors.shipping_carrier} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="tracking_number">Tracking number</Label>
                        <Input
                            id="tracking_number"
                            value={data.tracking_number}
                            onChange={(e) =>
                                setData('tracking_number', e.target.value)
                            }
                        />
                        <InputError message={errors.tracking_number} />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Confirm shipment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
