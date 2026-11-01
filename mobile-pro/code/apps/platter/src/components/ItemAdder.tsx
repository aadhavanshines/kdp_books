import { ApiError, quantityInCart, useCart, useRemoveCartLine, useSetCartItem, useUpdateCartLine, type MenuItem, type SetCartItemInput } from '@pro/api';
import { BottomSheet, Button, Text, useToast } from '@pro/ui';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { lineForSelection, linesForItem, toCartOptions, type Selection } from '../lib/customize';
import { CustomizeSheet } from './CustomizeSheet';

interface Conflict {
  input: SetCartItemInput;
  from: string;
  to: string;
}

/**
 * Adding dishes to the cart from any list: plain dishes go straight in,
 * customisable ones open the customisation sheet, and a dish from another
 * restaurant asks before replacing the cart. Render `sheets` once.
 */
export function useItemAdder(restaurantName: string | undefined) {
  const { data: cart } = useCart('platter');
  const setItem = useSetCartItem('platter');
  const updateLine = useUpdateCartLine('platter');
  const removeLine = useRemoveCartLine('platter');
  const toast = useToast();
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  // Steppers move at once, before the server answers.
  const [pending, setPending] = useState<Record<string, number>>({});
  // Search results mix restaurants: the dish being added names its own.
  const target = useRef(restaurantName);

  const submit = useCallback(
    (input: SetCartItemInput, displayQuantity: number, onDone?: () => void) => {
      setPending((p) => ({ ...p, [input.productId]: displayQuantity }));
      setItem.mutate(input, {
        onSuccess: () => onDone?.(),
        onError: (error) => {
          if (error instanceof ApiError && error.code === 'CART_CONFLICT') {
            setCustomizing(null);
            setConflict({ input, from: cart?.restaurant?.name ?? 'another restaurant', to: target.current ?? restaurantName ?? 'this restaurant' });
          } else toast.show({ message: error.message, tone: 'danger' });
        },
        onSettled: () =>
          setPending((p) => {
            const { [input.productId]: _done, ...rest } = p;
            return rest;
          }),
      });
    },
    [setItem, toast, cart?.restaurant?.name, restaurantName],
  );

  const quantityOf = (itemId: string) => pending[itemId] ?? quantityInCart(cart, itemId);

  const change = (item: MenuItem, next: number, fromRestaurant?: string) => {
    target.current = fromRestaurant ?? restaurantName;
    const current = quantityOf(item.id);
    const customizable = item.customizations.length > 0;
    if (next > current) {
      if (customizable) setCustomizing(item);
      else submit({ productId: item.id, quantity: next }, next);
      return;
    }
    const lines = linesForItem(cart, item.id);
    if (lines.length > 1) {
      toast.show({
        message: 'This dish has more than one customisation. Remove it from the cart.',
        actionLabel: 'VIEW CART',
        onAction: () => router.push('/cart'),
      });
      return;
    }
    const line = lines[0];
    if (!line) return;
    if (!customizable) submit({ productId: item.id, quantity: next }, next);
    else if (line.quantity <= 1) removeLine.mutate(line.id);
    else updateLine.mutate({ lineId: line.id, input: { quantity: line.quantity - 1 } });
  };

  const addCustomized = (item: MenuItem, selection: Selection, quantity: number) => {
    const existing = lineForSelection(cart, item.id, selection)?.quantity ?? 0;
    submit(
      { productId: item.id, quantity: existing + quantity, options: toCartOptions(selection) },
      quantityOf(item.id) + quantity,
      () => {
        setCustomizing(null);
        toast.show({ message: `${item.name} added to cart`, tone: 'success', icon: { name: 'checkmark-circle' } });
      },
    );
  };

  const sheets = (
    <>
      <CustomizeSheet item={customizing} onClose={() => setCustomizing(null)} onAdd={addCustomized} busy={setItem.isPending} />
      <BottomSheet visible={!!conflict} onClose={() => setConflict(null)} title="Replace cart item?" testID="replace-sheet">
        <View style={styles.conflict}>
          <Text variant="footnote" color="textSecondary">
            {`Your cart contains dishes from ${conflict?.from}. Do you want to discard them and add dishes from ${conflict?.to}?`}
          </Text>
          <View style={styles.buttons}>
            <Button title="No" variant="secondary" size="lg" style={styles.flex} onPress={() => setConflict(null)} />
            <Button
              title="Replace"
              size="lg"
              style={styles.flex}
              onPress={() => {
                if (!conflict) return;
                const input = { ...conflict.input, replaceCart: true };
                setConflict(null);
                submit(input, input.quantity);
              }}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );

  return { cart, quantityOf, change, sheets, busy: setItem.isPending };
}

const styles = StyleSheet.create({
  conflict: { gap: 20, paddingBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
