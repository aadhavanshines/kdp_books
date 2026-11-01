import { Icon, useTheme, type IoniconName } from '@pro/ui';
import { Tabs } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: { name: string; title: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'categories', title: 'Categories', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'orders', title: 'Orders', icon: 'bag-handle-outline', iconActive: 'bag-handle' },
  { name: 'account', title: 'Account', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabsLayout() {
  const { colors, fontFamilies } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          height: 62 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamilies[600], fontSize: 11, lineHeight: 14 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ focused }) => <Icon name={focused ? tab.iconActive : tab.icon} size={22} color={focused ? 'text' : 'textMuted'} />,
          }}
        />
      ))}
    </Tabs>
  );
}
