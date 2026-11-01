import { useLumoNotifications, useMe } from '@pro/api';
import { Avatar, Icon, useTheme, type IoniconName } from '@pro/ui';
import { Tabs } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: { name: string; title: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'explore', title: 'Explore', icon: 'search-outline', iconActive: 'search' },
  { name: 'create', title: 'Create', icon: 'add-circle-outline', iconActive: 'add-circle' },
  { name: 'activity', title: 'Activity', icon: 'heart-outline', iconActive: 'heart' },
  { name: 'profile', title: 'Profile', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe().data;
  const unread = useLumoNotifications().data?.filter((n) => !n.isRead).length ?? 0;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          height: 52 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.name === 'activity' && unread > 0 ? `Activity, ${unread} new` : tab.title,
            tabBarIcon: ({ focused }) => {
              if (tab.name === 'profile' && me) {
                return (
                  <View style={[styles.avatar, { borderColor: focused ? colors.text : 'transparent' }]}>
                    <Avatar name={me.name} art={me.avatar} size={26} />
                  </View>
                );
              }
              return (
                <View>
                  <Icon name={focused ? tab.iconActive : tab.icon} size={tab.name === 'create' ? 29 : 27} />
                  {tab.name === 'activity' && unread > 0 ? <View style={[styles.dot, { backgroundColor: colors.like }]} /> : null}
                </View>
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatar: { borderWidth: 1.5, borderRadius: 16, padding: 1 },
  dot: { position: 'absolute', bottom: -7, alignSelf: 'center', width: 5, height: 5, borderRadius: 3 },
});
