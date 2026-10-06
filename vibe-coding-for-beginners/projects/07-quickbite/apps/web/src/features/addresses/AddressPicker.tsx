import { Briefcase, Home, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Address } from '../../backend';
import { Sheet } from '../../components/ui/Sheet';
import { cn } from '../../lib/cn';
import { AddressForm } from './AddressForm';
import { formatAddress } from './formatAddress';
import { useAddresses } from './queries';

const ICONS = { Home, Work: Briefcase, Other: MapPin } as const;

export function AddressIcon({ label, className }: { label: Address['label']; className?: string }) {
  const Icon = ICONS[label];
  return <Icon className={className} aria-hidden />;
}

interface AddressSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: string | null;
  onSelect: (address: Address) => void;
  defaultAreaId: string | null;
}

/** Pick a saved address or add a new one. */
export function AddressSheet({
  open,
  onOpenChange,
  selectedId,
  onSelect,
  defaultAreaId,
}: AddressSheetProps) {
  const { data: addresses = [] } = useAddresses();
  const [adding, setAdding] = useState(false);
  const showForm = adding || addresses.length === 0;

  const choose = (a: Address) => {
    onSelect(a);
    setAdding(false);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setAdding(false);
        onOpenChange(o);
      }}
      title={showForm ? 'Add delivery address' : 'Choose a delivery address'}
    >
      {showForm ? (
        <AddressForm defaultAreaId={defaultAreaId} onSaved={choose} />
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-brand-300 p-4 font-bold text-brand-700 hover:bg-brand-50"
          >
            <Plus className="size-5" aria-hidden /> Add new address
          </button>
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => choose(a)}
              aria-pressed={a.id === selectedId}
              className={cn(
                'flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors',
                a.id === selectedId
                  ? 'border-success bg-success/5'
                  : 'border-line hover:border-ink/25',
              )}
            >
              <AddressIcon label={a.label} className="mt-0.5 size-5 shrink-0 text-muted" />
              <span>
                <span className="block font-extrabold">{a.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{formatAddress(a)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
