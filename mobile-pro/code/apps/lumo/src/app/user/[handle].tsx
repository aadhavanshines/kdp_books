import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '../../components/ProfileView';

export default function UserScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  return <ProfileView handle={handle} />;
}
