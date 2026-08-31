import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Clock, Store, XCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import { store } from '@/routes/seller/apply';
import type { Shop } from '@/types';

type Props = {
    shop: Shop | null;
};

const STATUS_UI = {
    pending: { icon: Clock, tone: 'text-amber-600', label: 'Pending review' },
    verified: {
        icon: CheckCircle2,
        tone: 'text-emerald-600',
        label: 'Verified',
    },
    rejected: { icon: XCircle, tone: 'text-red-600', label: 'Rejected' },
    suspended: { icon: XCircle, tone: 'text-red-600', label: 'Suspended' },
} as const;

export default function SellerApply({ shop }: Props) {
    if (shop) {
        const ui = STATUS_UI[shop.status];
        const Icon = ui.icon;

        return (
            <>
                <Head title="Your shop" />
                <div className="mx-auto w-full max-w-2xl p-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="size-5" /> {shop.name}
                                </CardTitle>
                                <Badge variant="secondary" className={ui.tone}>
                                    <Icon className="mr-1 size-3.5" />{' '}
                                    {ui.label}
                                </Badge>
                            </div>
                            <CardDescription>{shop.bio}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {shop.status === 'pending' && (
                                <p className="text-muted-foreground">
                                    Thanks for applying. Our team is reviewing
                                    your shop and you'll be able to list items
                                    once you're verified.
                                </p>
                            )}
                            {shop.status === 'verified' && (
                                <p className="text-muted-foreground">
                                    Your shop is verified — you can start
                                    listing items for sale or auction.
                                </p>
                            )}
                            {shop.status === 'rejected' &&
                                shop.rejection_reason && (
                                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                        <p className="font-medium">Reason</p>
                                        <p>{shop.rejection_reason}</p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Become a seller" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="size-5" /> Open your shop
                        </CardTitle>
                        <CardDescription>
                            Sell your second-hand clothing, watches and bags.
                            Shops are reviewed before going live.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...store.form()} className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Shop name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            autoFocus
                                            placeholder="e.g. Thrift Threads"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">
                                            About your shop
                                        </Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            placeholder="What kind of pieces do you sell?"
                                        />
                                        <InputError message={errors.bio} />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-fit"
                                    >
                                        {processing && <Spinner />}
                                        Submit application
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SellerApply.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Become a seller', href: '/sell/apply' },
    ],
};
