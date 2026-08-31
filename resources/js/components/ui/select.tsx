import { Select as SelectPrimitive } from '@base-ui-components/react/select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Base UI's <Select.Value> shows the raw value unless it can map value -> label.
 * To keep the shadcn API (consumers just nest <SelectItem value>label</SelectItem>),
 * the Select root walks its children and exposes a value->label map via context,
 * which <SelectValue> uses to render the selected label and the placeholder.
 */
const SelectLabelsContext = React.createContext<Record<string, React.ReactNode>>({});

function collectItemLabels(node: React.ReactNode, map: Record<string, React.ReactNode>): void {
    React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) {
            return;
        }
        const props = child.props as { value?: unknown; children?: React.ReactNode };
        if (child.type === SelectItem && props.value != null) {
            map[String(props.value)] = props.children;
        }
        if (props.children) {
            collectItemLabels(props.children, map);
        }
    });
}

type SelectRootProps = Omit<
    React.ComponentProps<typeof SelectPrimitive.Root>,
    'value' | 'defaultValue' | 'onValueChange'
> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

function Select({ children, onValueChange, ...props }: SelectRootProps) {
    const labels = React.useMemo(() => {
        const map: Record<string, React.ReactNode> = {};
        collectItemLabels(children, map);
        return map;
    }, [children]);

    return (
        <SelectLabelsContext.Provider value={labels}>
            <SelectPrimitive.Root
                data-slot="select"
                onValueChange={
                    onValueChange as React.ComponentProps<typeof SelectPrimitive.Root>['onValueChange']
                }
                {...props}
            >
                {children}
            </SelectPrimitive.Root>
        </SelectLabelsContext.Provider>
    );
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
    placeholder,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & { placeholder?: React.ReactNode }) {
    const labels = React.useContext(SelectLabelsContext);

    return (
        <SelectPrimitive.Value data-slot="select-value" {...props}>
            {(value: unknown) => {
                if (value == null || value === '') {
                    return <span className="text-muted-foreground">{placeholder}</span>;
                }
                return labels[String(value)] ?? String(value);
            }}
        </SelectPrimitive.Value>
    );
}

function SelectTrigger({
    className,
    size = 'default',
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'default' }) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon>
                <ChevronDownIcon className="size-4 opacity-50" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup>) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Positioner sideOffset={4} className="z-50" alignItemWithTrigger={false}>
                <SelectPrimitive.Popup
                    data-slot="select-content"
                    className={cn(
                        'bg-popover text-popover-foreground relative z-50 max-h-[min(24rem,var(--available-height))] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                        className,
                    )}
                    {...props}
                >
                    <div className="p-1">{children}</div>
                </SelectPrimitive.Popup>
            </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
    return (
        <SelectPrimitive.GroupLabel
            data-slot="select-label"
            className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
            {...props}
        />
    );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            <span
                data-slot="select-item-indicator"
                className="absolute right-2 flex size-3.5 items-center justify-center"
            >
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="select-separator"
            className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
    return (
        <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
    return (
        <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownArrow>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
