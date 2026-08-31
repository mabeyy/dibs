import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { RatingStars } from '@/components/rating-stars';
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
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { review as reviewOrder } from '@/routes/orders';

export function ReviewDialog({
    orderId,
    shopName,
}: {
    orderId: number;
    shopName: string;
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 0,
        body: '',
    });

    const submit = () => {
        post(reviewOrder(orderId).url, {
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
                <Button size="sm" variant="outline">
                    Leave review
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Review {shopName}</DialogTitle>
                    <DialogDescription>
                        How was your experience with this shop?
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Rating</Label>
                        <RatingStars
                            rating={data.rating}
                            onRate={(v) => setData('rating', v)}
                            size={28}
                        />
                        {errors.rating && (
                            <p className="text-destructive text-sm">
                                {errors.rating}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="body">Comment (optional)</Label>
                        <Textarea
                            id="body"
                            rows={3}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Tell others about the item and the seller…"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={submit}
                        disabled={processing || data.rating === 0}
                    >
                        {processing && <Spinner />}
                        Submit review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
