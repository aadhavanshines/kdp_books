import { useCart } from '@pro/api';
import { Icon, useTheme, type IoniconName } from '@pro/ui';
import { Tabs } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: { name: string; title: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'index', title: 'Home', icon: 'restaurant-outline', iconActive: 'restaurant' },
  { name: 'search', title: 'Search', icon: 'search-outline', iconActive: 'search' },
  { name: 'orders', title: 'Orders', icon: 'receipt-outline', iconActive: 'receipt' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  const { colors, fontFamilies } = useTheme();
  const insets = useSafeAreaInsets();
  // Keeps the cart warm for the cart bar on Home and Search.
  useCart('platter');
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          height: 66 + insets.bottom,
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
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? tab.iconActive : tab.icon} size={22} color={focused ? 'primary' : 'textMuted'} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
