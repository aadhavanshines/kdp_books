import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  Inter_900Black_Italic,
} from '@expo-google-fonts/inter';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';

import { ScreenFocusProvider } from './focus/ScreenFocus';
import { installWebNavigator } from './focus/webNavigator';
import { backRegistry } from './nav/back';
import { canGoBack, type Route } from './nav/stack';
import { BrowseScreen } from './screens/BrowseScreen';
import { DetailsScreen } from './screens/DetailsScreen';
import { GuideScreen } from './screens/GuideScreen';
import { MyListScreen } from './screens/MyListScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { ProfilesScreen } from './screens/ProfilesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AppStateProvider, useApp } from './state/AppState';
import { colors } from './theme/tokens';

const fonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  Inter_900Black_Italic,
  ...Ionicons.font,
};

/** Web: no browser focus outline (the app draws its own), no page scroll, dark canvas. */
const WEB_CSS = `
html, body, #root { height: 100%; margin: 0; overflow: hidden; background: ${colors.background}; }
[data-focusable], [tabindex] { outline: none !important; }
`;

function routeKey(route: Route): string {
  switch (route.name) {
    case 'browse':
      return `browse-${route.section}`;
    case 'details':
      return `details-${route.titleId}`;
    case 'player':
      return `player-${route.titleId}-${route.episodeId ?? ''}${route.trailer ? '-trailer' : ''}`;
    case 'live':
      return `live-${route.channelId}`;
    default:
      return route.name;
  }
}

function RouteView({ route }: { route: Route }) {
  switch (route.name) {
    case 'profiles':
      return <ProfilesScreen />;
    case 'browse':
      return route.section === 'mylist' ? <MyListScreen /> : <BrowseScreen section={route.section} />;
    case 'search':
      return <SearchScreen initialQuery={route.query} />;
    case 'guide':
      return <GuideScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'details':
      return <DetailsScreen titleId={route.titleId} />;
    case 'player':
      return <PlayerScreen titleId={route.titleId} episodeId={route.episodeId} startSec={route.startSec} trailer={route.trailer} />;
    case 'live':
      return <PlayerScreen channelId={route.channelId} />;
  }
}

function Root() {
  const { nav, navigate } = useApp();
  const navRef = useRef(nav);
  useEffect(() => {
    navRef.current = nav;
  });

  // The last resort for Back: pop the stack. On the profile picker Back is not
  // handled, so Android TV leaves the app as users expect.
  useEffect(
    () =>
      backRegistry.add(() => {
        if (!canGoBack(navRef.current)) return false;
        navigate({ type: 'back' });
        return true;
      }),
    [navigate],
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = WEB_CSS;
      document.head.appendChild(style);
      const uninstall = installWebNavigator({ onBack: () => backRegistry.dispatch() });
      return () => {
        uninstall();
        style.remove();
      };
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => backRegistry.dispatch());
    return () => sub.remove();
  }, []);

  const last = nav.stack.length - 1;
  return (
    <View style={styles.root}>
      {nav.stack.map((route, i) => (
        <View key={`${i}-${routeKey(route)}`} style={[StyleSheet.absoluteFill, { display: i === last ? 'flex' : 'none' }]}>
          <ScreenFocusProvider screenId={`s${i}-${routeKey(route)}`} active={i === last}>
            <RouteView route={route} />
          </ScreenFocusProvider>
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [loaded, error] = useFonts(fonts);
  if (!loaded && !error) return <View style={styles.root} />;
  return (
    <AppStateProvider>
      <StatusBar hidden style="light" />
      <Root />
    </AppStateProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
});
