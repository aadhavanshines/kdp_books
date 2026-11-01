import { SessionProvider, type ApiClient } from '@pro/api';
import { testQueryClient } from '@pro/api/testing';
import { ThemeProvider, ToastProvider } from '@pro/ui';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { fakeClient, type Route } from '@pro/api/testing';

const metrics = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

/** Renders a screen inside the app's providers with a fake API. */
export function renderScreen(ui: ReactElement, client: ApiClient) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider brand="platter" scheme="light">
        <SessionProvider storageKey="platter.token" client={client} queryClient={testQueryClient()}>
          <ToastProvider>{ui}</ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}
