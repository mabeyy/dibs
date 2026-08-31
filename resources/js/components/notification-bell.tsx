import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { index as notificationsIndex } from '@/routes/notifications';

export function NotificationBell({ className }: { className?: string }) {
    const { auth } = usePage().props;
    const unread = auth.notifications?.unread ?? 0;

    return (
        <Link
            href={notificationsIndex().url}
            aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
            className={cn(
                'hover:bg-accent relative inline-flex size-9 items-center justify-center rounded-md transition',
                className,
            )}
        >
            <Bell className="size-5" />
            {unread > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-medium">
                    {unread > 9 ? '9+' : unread}
                </span>
            )}
        </Link>
    );
}
