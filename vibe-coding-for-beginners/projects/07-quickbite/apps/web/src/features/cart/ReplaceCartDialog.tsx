import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { useCart } from './cartStore';

/** "Replace cart item?" prompt shown when adding from a different restaurant. Mounted once in the layout. */
export function ReplaceCartDialog() {
  const pending = useCart((s) => s.pendingReplace);
  const current = useCart((s) => s.restaurant);
  const confirm = useCart((s) => s.confirmReplace);
  const cancel = useCart((s) => s.cancelReplace);

  return (
    <Sheet
      open={Boolean(pending)}
      onOpenChange={(open) => !open && cancel()}
      title="Replace cart item?"
      description={
        pending && current
          ? `Your cart contains dishes from ${current.name}. Do you want to discard them and add dishes from ${pending.restaurant.name}?`
          : undefined
      }
      footer={
        <div className="flex gap-3">
          <Button variant="outline" block onClick={cancel}>
            No
          </Button>
          <Button block onClick={confirm}>
            Replace
          </Button>
        </div>
      }
    >
      <span />
    </Sheet>
  );
}
