import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    Heart,
    LayoutGrid,
    PackageSearch,
    Receipt,
    ShieldCheck,
    Store,
    Tag,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { browse, dashboard } from '@/routes';
import { index as adminShops } from '@/routes/admin/shops';
import { index as ordersIndex } from '@/routes/orders';
import { apply as sellerApply } from '@/routes/seller';
import { index as sellerListings } from '@/routes/seller/listings';
import { index as watchlistIndex } from '@/routes/watchlist';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const user = usePage().props.auth.user;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Browse',
            href: browse(),
            icon: PackageSearch,
        },
        {
            title: 'Watchlist',
            href: watchlistIndex(),
            icon: Heart,
        },
        {
            title: 'My listings',
            href: sellerListings(),
            icon: Tag,
        },
        {
            title: 'Orders',
            href: ordersIndex(),
            icon: Receipt,
        },
        {
            title: 'Sell',
            href: sellerApply(),
            icon: Store,
        },
    ];

    if (user?.is_admin) {
        mainNavItems.push({
            title: 'Shop moderation',
            href: adminShops(),
            icon: ShieldCheck,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
