import { Link, usePage } from '@inertiajs/react';
import {
    Heart,
    MessageCircle,
    Search,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { home, login, register } from '@/routes';
import { browse } from '@/routes';
import { dashboard } from '@/routes';
import { index as messagesIndex } from '@/routes/messages';
import { index as ordersIndex } from '@/routes/orders';
import { index as watchlistIndex } from '@/routes/watchlist';

const CATEGORIES = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'bags', label: 'Bags' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'watches', label: 'Watches' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'jewelry', label: 'Jewelry' },
];

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = usePage().props.auth?.user;
    const [query, setQuery] = useState('');

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <ShoppingBag className="size-5" />
                        <span>Dibs</span>
                    </Link>

                    <form
                        action={browse().url}
                        method="get"
                        className="relative hidden flex-1 md:block"
                    >
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            name="q"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search second-hand fashion, bags, shoes…"
                            className="pl-9"
                        />
                    </form>

                    <nav className="ml-auto flex items-center gap-2">
                        {user ? (
                            <>
                                <Button asChild variant="ghost" size="icon">
                                    <Link
                                        href={watchlistIndex().url}
                                        aria-label="Watchlist"
                                    >
                                        <Heart className="size-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon">
                                    <Link
                                        href={ordersIndex().url}
                                        aria-label="My cart"
                                    >
                                        <ShoppingCart className="size-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon">
                                    <Link
                                        href={messagesIndex().url}
                                        aria-label="Messages"
                                    >
                                        <MessageCircle className="size-5" />
                                    </Link>
                                </Button>
                                <NotificationBell />
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={dashboard()}>Account</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={register()}>Sign up</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>

                <div className="border-border/60 border-t">
                    <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2 text-sm">
                        <Link
                            href={browse().url}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            All
                        </Link>
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.value}
                                href={
                                    browse({
                                        query: { category: category.value },
                                    }).url
                                }
                                className="text-muted-foreground hover:text-foreground"
                            >
                                {category.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
                {children}
            </main>

            <footer className="border-border/60 text-muted-foreground border-t py-6 text-center text-sm">
                Dibs · second-hand fashion, bags, shoes, watches &amp;
                accessories
            </footer>
        </div>
    );
}
