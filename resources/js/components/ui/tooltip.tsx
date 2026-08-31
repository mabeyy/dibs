import { Tooltip as TooltipPrimitive } from '@base-ui-components/react/tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

function TooltipProvider({
    delayDuration = 0,
    ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Provider>, 'delay'> & { delayDuration?: number }) {
    return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delayDuration} {...props} />;
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & { asChild?: boolean }) {
    if (asChild && React.isValidElement(children)) {
        return (
            <TooltipPrimitive.Trigger
                data-slot="tooltip-trigger"
                render={children as React.ReactElement<Record<string, unknown>>}
                {...props}
            />
        );
    }
    return (
        <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props}>
            {children}
        </TooltipPrimitive.Trigger>
    );
}

function TooltipContent({
    className,
    sideOffset = 4,
    side = 'top',
    align = 'center',
    hidden,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
    sideOffset?: number;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    hidden?: boolean;
}) {
    if (hidden) {
        return null;
    }

    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side} align={align} className="z-50">
                <TooltipPrimitive.Popup
                    data-slot="tooltip-content"
                    className={cn(
                        'bg-primary text-primary-foreground z-50 w-fit max-w-sm rounded-md px-3 py-1.5 text-xs text-balance transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                        className,
                    )}
                    {...props}
                >
                    {children}
                    <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 rotate-45 rounded-[2px]" />
                </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
