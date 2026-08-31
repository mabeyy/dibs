import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, ShieldX, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import { reject, suspend, verify } from '@/routes/admin/shops';
import type { Shop } from '@/types';

type Props = {
    pending: Shop[];
    decided: Shop[];
};

const STATUS_TONE: Record<Shop['status'], string> = {
    pending: 'text-amber-600',
    verified: 'text-emerald-600',
    rejected: 'text-red-600',
    suspended: 'text-red-600',
};

function ShopRow({ shop, actions }: { shop: Shop; actions?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <Store className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate font-medium">{shop.name}</span>
                    <Badge
                        variant="secondary"
                        className={STATUS_TONE[shop.status]}
                    >
                        {shop.status}
                    </Badge>
                </div>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                    {shop.owner?.name} · {shop.owner?.email}
                </p>
                {shop.bio && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {shop.bio}
                    </p>
                )}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
    );
}

export default function AdminShops({ pending, decided }: Props) {
    const [rejecting, setRejecting] = useState<Shop | null>(null);
    const [reason, setReason] = useState('');

    const submitReject = () => {
        if (!rejecting) {
            return;
        }
        router.patch(
            reject(rejecting.id).url,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejecting(null);
                    setReason('');
                },
            },
        );
    };

    return (
        <>
            <Head title="Shop moderation" />
            <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending review ({pending.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pending.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                No shops awaiting review.
                            </p>
                        )}
                        {pending.map((shop) => (
                            <ShopRow
                                key={shop.id}
                                shop={shop}
                                actions={
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.patch(
                                                    verify(shop.id).url,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <CheckCircle2 className="size-4" />{' '}
                                            Verify
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setRejecting(shop)}
                                        >
                                            <ShieldX className="size-4" />{' '}
                                            Reject
                                        </Button>
                                    </>
                                }
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently decided</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {decided.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Nothing here yet.
                            </p>
                        )}
                        {decided.map((shop) => (
                            <ShopRow
                                key={shop.id}
                                shop={shop}
                                actions={
                                    shop.status === 'verified' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.patch(
                                                    suspend(shop.id).url,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Suspend
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.patch(
                                                    verify(shop.id).url,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <CheckCircle2 className="size-4" />{' '}
                                            Verify
                                        </Button>
                                    )
                                }
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={rejecting !== null}
                onOpenChange={(open) => !open && setRejecting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject {rejecting?.name}</DialogTitle>
                        <DialogDescription>
                            Let the seller know why their shop wasn't approved.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Listings appear to include prohibited items."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejecting(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitReject}
                            disabled={reason.trim().length === 0}
                        >
                            Reject shop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminShops.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Shop moderation', href: '/admin/shops' },
    ],
};
