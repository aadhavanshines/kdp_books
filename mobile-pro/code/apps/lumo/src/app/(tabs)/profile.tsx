import { useMe } from '@pro/api';
import { View } from 'react-native';

import { ProfileView } from '../../components/ProfileView';

export default function MyProfileScreen() {
  const me = useMe().data;
  if (!me?.handle) return <View />;
  return <ProfileView handle={me.handle} isTab />;
}
