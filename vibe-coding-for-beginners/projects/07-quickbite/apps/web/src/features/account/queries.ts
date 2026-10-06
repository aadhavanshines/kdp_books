import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBackend, type Profile } from '../../backend';
import { useUid } from '../auth/sessionStore';

export function useProfile() {
  const uid = useUid();
  return useQuery({
    queryKey: ['profile', uid],
    queryFn: async () => (await getBackend()).profile.get(),
    enabled: Boolean(uid),
  });
}

export function useSaveProfile() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => (await getBackend()).profile.save(profile),
    onSuccess: (saved) => client.setQueryData(['profile', uid], saved),
  });
}
