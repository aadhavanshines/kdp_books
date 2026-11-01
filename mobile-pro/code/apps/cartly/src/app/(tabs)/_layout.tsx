import { useCart } from '@pro/api';
import { Icon, useTheme, type IoniconName } from '@pro/ui';
import { Tabs } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: { name: string; title: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'categories', title: 'Categories', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'wishlist', title: 'Wishlist', icon: 'heart-outline', iconActive: 'heart' },
  { name: 'cart', title: 'Cart', icon: 'cart-outline', iconActive: 'cart' },
  { name: 'account', title: 'Account', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabsLayout() {
  const { colors, fontFamilies } = useTheme();
  const insets = useSafeAreaInsets();
  const count = useCart('cartly').data?.itemCount ?? 0;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          height: 62 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamilies[600], fontSize: 11, lineHeight: 14 },
        tabBarBadgeStyle: { backgroundColor: colors.danger, color: colors.textInverse, fontFamily: fontFamilies[700], fontSize: 10 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.name === 'cart' && count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : tab.title,
            tabBarBadge: tab.name === 'cart' && count > 0 ? (count > 99 ? '99+' : count) : undefined,
            tabBarIcon: ({ focused }) => (
              <Icon name={focused ? tab.iconActive : tab.icon} size={23} color={focused ? 'primary' : 'textMuted'} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
