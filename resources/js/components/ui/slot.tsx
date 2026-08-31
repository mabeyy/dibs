import * as React from 'react';

/**
 * A minimal, dependency-free replacement for Radix's `<Slot>` so shadcn's
 * `asChild` pattern keeps working on top of Base UI. It merges the slot's props
 * onto its single child element: className/style are combined, event handlers
 * are composed, refs are merged, and any other child prop wins over the slot.
 */

type AnyProps = Record<string, unknown>;

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (node: T | null) => {
        for (const ref of refs) {
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref && typeof ref === 'object') {
                (ref as React.RefObject<T | null>).current = node;
            }
        }
    };
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
    const merged: AnyProps = { ...slotProps };

    for (const key in childProps) {
        const slotValue = slotProps[key];
        const childValue = childProps[key];

        if (/^on[A-Z]/.test(key)) {
            if (typeof slotValue === 'function' && typeof childValue === 'function') {
                merged[key] = (...args: unknown[]) => {
                    (childValue as (...a: unknown[]) => void)(...args);
                    (slotValue as (...a: unknown[]) => void)(...args);
                };
            } else {
                merged[key] = childValue ?? slotValue;
            }
        } else if (key === 'className') {
            merged[key] = [slotValue, childValue].filter(Boolean).join(' ');
        } else if (key === 'style') {
            merged[key] = { ...(slotValue as object), ...(childValue as object) };
        } else {
            merged[key] = childValue;
        }
    }

    return merged;
}

export const Slot = React.forwardRef<HTMLElement, { children?: React.ReactNode } & AnyProps>(
    function Slot({ children, ...slotProps }, forwardedRef) {
        if (!React.isValidElement(children)) {
            return null;
        }

        const childProps = children.props as AnyProps;
        const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref ?? (childProps.ref as React.Ref<HTMLElement>);

        const props = mergeProps(slotProps, childProps);
        props.ref = forwardedRef ? composeRefs(forwardedRef, childRef) : childRef;

        return React.cloneElement(children, props);
    },
);
