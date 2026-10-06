import { useId, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import type { Address } from '../../backend';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { cn } from '../../lib/cn';
import { useAreas } from '../catalog/queries';
import { addressSchema, type AddressInput } from './addressSchema';
import { useSaveAddress } from './queries';

interface AddressFormProps {
  defaultAreaId: string | null;
  onSaved: (address: Address) => void;
}

const LABELS = ['Home', 'Work', 'Other'] as const;

export function AddressForm({ defaultAreaId, onSaved }: AddressFormProps) {
  const { data: areas } = useAreas();
  const save = useSaveAddress();
  const [values, setValues] = useState<AddressInput>({
    label: 'Home',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    landmark: '',
    areaId: defaultAreaId ?? '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInput, string>>>({});

  const set = (key: keyof AddressInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = addressSchema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues)
        next[issue.path[0] as keyof AddressInput] ??= issue.message;
      setErrors(next);
      return;
    }
    save.mutate(parsed.data, { onSuccess: onSaved });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink-soft">Save address as</legend>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <Chip
              key={l}
              selected={values.label === l}
              onClick={() => setValues((v) => ({ ...v, label: l }))}
            >
              {l}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Field
        label="Flat / house no., building"
        error={errors.line1}
        value={values.line1}
        onChange={set('line1')}
        autoComplete="address-line1"
      />
      <Field
        label="Street, sector, locality"
        error={errors.line2}
        value={values.line2}
        onChange={set('line2')}
        autoComplete="address-line2"
      />
      <Field
        label="Landmark (optional)"
        error={errors.landmark}
        value={values.landmark}
        onChange={set('landmark')}
      />
      <div className="grid grid-cols-[1fr_130px] gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-soft">Area</span>
          <select
            value={values.areaId}
            onChange={set('areaId')}
            className={cn(
              'h-12 w-full rounded-xl border bg-white px-3 text-[15px] font-medium focus:border-brand-500 focus:outline-none',
              errors.areaId ? 'border-danger' : 'border-line',
            )}
          >
            <option value="">Choose…</option>
            {areas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}, {a.city}
              </option>
            ))}
          </select>
          {errors.areaId && (
            <span className="mt-1 block text-xs font-semibold text-danger">{errors.areaId}</span>
          )}
        </label>
        <Field
          label="PIN code"
          error={errors.pincode}
          value={values.pincode}
          onChange={set('pincode')}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Receiver’s name"
          error={errors.name}
          value={values.name}
          onChange={set('name')}
          autoComplete="name"
        />
        <Field
          label="Mobile number"
          error={errors.phone}
          value={values.phone}
          onChange={set('phone')}
          inputMode="tel"
          autoComplete="tel"
          type="tel"
        />
      </div>
      {save.isError && (
        <p className="text-sm font-semibold text-danger">
          Couldn’t save the address. Please try again.
        </p>
      )}
      <Button type="submit" block size="lg" disabled={save.isPending}>
        {save.isPending ? 'Saving…' : 'Save address & proceed'}
      </Button>
    </form>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

function Field({ label, error, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-ink-soft">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none',
          error ? 'border-danger' : 'border-line',
        )}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
