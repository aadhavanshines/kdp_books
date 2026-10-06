import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBackend, type Address, type NewAddress } from '../../backend';
import { useUid } from '../auth/sessionStore';

const key = (uid: string | null) => ['addresses', uid] as const;

/** The signed-in customer's saved addresses (disabled while signed out). */
export function useAddresses() {
  const uid = useUid();
  return useQuery({
    queryKey: key(uid),
    queryFn: async () => (await getBackend()).addresses.list(),
    enabled: Boolean(uid),
  });
}

export function useSaveAddress() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (address: NewAddress & { id?: string }) =>
      (await getBackend()).addresses.save(address),
    onSuccess: (saved) =>
      client.setQueryData<Address[]>(key(uid), (list = []) => [
        saved,
        ...list.filter((a) => a.id !== saved.id),
      ]),
  });
}

export function useRemoveAddress() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await getBackend()).addresses.remove(id),
    onSuccess: (_, id) =>
      client.setQueryData<Address[]>(key(uid), (list = []) => list.filter((a) => a.id !== id)),
  });
}
