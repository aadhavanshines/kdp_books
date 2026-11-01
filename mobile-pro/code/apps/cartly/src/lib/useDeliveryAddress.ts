import { defaultAddress, type Address } from '@pro/api';
import { useState } from 'react';

/** The address picked in this session, shared by the cart and checkout. */
const session: { addressId: string | undefined } = { addressId: undefined };

function rememberAddress(id: string) {
  session.addressId = id;
}

/**
 * The address the shopper is checking out to: the one they picked in this
 * session (cart and checkout share it), else the default.
 */
export function useDeliveryAddress(addresses: readonly Address[] | undefined): [Address | undefined, (id: string) => void] {
  const [id, setId] = useState(() => session.addressId);
  const address = addresses?.find((a) => a.id === id) ?? defaultAddress(addresses);
  return [
    address,
    (next: string) => {
      rememberAddress(next);
      setId(next);
    },
  ];
}
