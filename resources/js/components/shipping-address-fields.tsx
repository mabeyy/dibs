import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ShippingValues = {
    ship_name: string;
    ship_line1: string;
    ship_line2: string;
    ship_city: string;
    ship_region: string;
    ship_postal_code: string;
    ship_country: string;
    ship_phone: string;
};

export const emptyShipping: ShippingValues = {
    ship_name: '',
    ship_line1: '',
    ship_line2: '',
    ship_city: '',
    ship_region: '',
    ship_postal_code: '',
    ship_country: '',
    ship_phone: '',
};

/**
 * Build a ShippingValues object from an order-like record, coercing nulls to ''.
 */
export function shippingFrom(
    source: Partial<Record<keyof ShippingValues, string | null>>,
): ShippingValues {
    return {
        ship_name: source.ship_name ?? '',
        ship_line1: source.ship_line1 ?? '',
        ship_line2: source.ship_line2 ?? '',
        ship_city: source.ship_city ?? '',
        ship_region: source.ship_region ?? '',
        ship_postal_code: source.ship_postal_code ?? '',
        ship_country: source.ship_country ?? '',
        ship_phone: source.ship_phone ?? '',
    };
}

type Props = {
    values: ShippingValues;
    onChange: (field: keyof ShippingValues, value: string) => void;
    errors: Partial<Record<keyof ShippingValues, string>>;
};

export function ShippingAddressFields({ values, onChange, errors }: Props) {
    return (
        <div className="grid gap-3">
            <Field
                id="ship_name"
                label="Full name"
                values={values}
                onChange={onChange}
                errors={errors}
            />
            <Field
                id="ship_line1"
                label="Address line 1"
                values={values}
                onChange={onChange}
                errors={errors}
            />
            <Field
                id="ship_line2"
                label="Address line 2 (optional)"
                values={values}
                onChange={onChange}
                errors={errors}
            />
            <div className="grid grid-cols-2 gap-3">
                <Field
                    id="ship_city"
                    label="City"
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
                <Field
                    id="ship_region"
                    label="State / region"
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field
                    id="ship_postal_code"
                    label="Postal code"
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
                <Field
                    id="ship_country"
                    label="Country"
                    values={values}
                    onChange={onChange}
                    errors={errors}
                />
            </div>
            <Field
                id="ship_phone"
                label="Phone (optional)"
                values={values}
                onChange={onChange}
                errors={errors}
            />
        </div>
    );
}

function Field({
    id,
    label,
    values,
    onChange,
    errors,
}: {
    id: keyof ShippingValues;
    label: string;
} & Props) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={values[id]}
                onChange={(e) => onChange(id, e.target.value)}
            />
            <InputError message={errors[id]} />
        </div>
    );
}
