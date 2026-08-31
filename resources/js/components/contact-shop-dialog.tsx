import { useForm } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store as sendMessage } from '@/routes/messages';

type Props = {
    listingId: number;
    shopName: string;
};

export function ContactShopDialog({ listingId, shopName }: Props) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        listing_id: listingId,
        body: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(sendMessage().url, {
            onSuccess: () => {
                reset('body');
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <MessageCircle className="size-4" /> Message shop
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Message {shopName}</DialogTitle>
                    <DialogDescription>
                        Ask about condition, measurements, or shipping.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <Textarea
                        rows={4}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Hi! Is this still available?"
                        autoFocus
                    />
                    <InputError message={errors.body} />
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing || data.body.trim() === ''}
                        >
                            {processing && <Spinner />}
                            Send message
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
