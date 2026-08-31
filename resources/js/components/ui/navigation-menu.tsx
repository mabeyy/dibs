import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui-components/react/navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function NavigationMenu({
    className,
    children,
    ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
    // `viewport` is accepted for API compatibility; Base UI renders its popup
    // via Portal/Positioner rather than an inline viewport.
    const { viewport: _viewport, ...rest } = props;

    return (
        <NavigationMenuPrimitive.Root
            data-slot="navigation-menu"
            className={cn(
                'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
                className,
            )}
            {...rest}
        >
            {children}
        </NavigationMenuPrimitive.Root>
    );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
    return (
        <NavigationMenuPrimitive.List
            data-slot="navigation-menu-list"
            className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
            {...props}
        />
    );
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
    return (
        <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn('relative', className)} {...props} />
    );
}

const navigationMenuTriggerStyle = cva(
    'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent/50 data-[popup-open]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1',
);

function NavigationMenuTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
    return (
        <NavigationMenuPrimitive.Trigger
            data-slot="navigation-menu-trigger"
            className={cn(navigationMenuTriggerStyle(), 'group', className)}
            {...props}
        >
            {children}{' '}
            <ChevronDownIcon
                className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[popup-open]:rotate-180"
                aria-hidden="true"
            />
        </NavigationMenuPrimitive.Trigger>
    );
}

function NavigationMenuContent({
    className,
    ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
    return (
        <NavigationMenuPrimitive.Content
            data-slot="navigation-menu-content"
            className={cn('top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto', className)}
            {...props}
        />
    );
}

function NavigationMenuViewport({
    className,
    ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
    return (
        <NavigationMenuPrimitive.Portal>
            <NavigationMenuPrimitive.Positioner className="absolute top-full left-0 isolate z-50 flex justify-center">
                <NavigationMenuPrimitive.Popup className="origin-top-center bg-popover text-popover-foreground relative mt-1.5 overflow-hidden rounded-md border shadow">
                    <NavigationMenuPrimitive.Viewport
                        data-slot="navigation-menu-viewport"
                        className={cn('relative h-full w-full', className)}
                        {...props}
                    />
                </NavigationMenuPrimitive.Popup>
            </NavigationMenuPrimitive.Positioner>
        </NavigationMenuPrimitive.Portal>
    );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
    return (
        <NavigationMenuPrimitive.Link
            data-slot="navigation-menu-link"
            className={cn(
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="navigation-menu-indicator"
            className={cn('top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden', className)}
            {...props}
        >
            <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
        </div>
    );
}

export {
    navigationMenuTriggerStyle,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
};
