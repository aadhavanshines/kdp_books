import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBackend, type Address, type NewAddress } from '../../backend';

const KEY = ['addresses'] as const;

export function useAddresses() {
  return useQuery({ queryKey: KEY, queryFn: async () => (await getBackend()).addresses.list() });
}

export function useSaveAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (address: NewAddress & { id?: string }) =>
      (await getBackend()).addresses.save(address),
    onSuccess: (saved) =>
      client.setQueryData<Address[]>(KEY, (list = []) => [
        saved,
        ...list.filter((a) => a.id !== saved.id),
      ]),
  });
}
