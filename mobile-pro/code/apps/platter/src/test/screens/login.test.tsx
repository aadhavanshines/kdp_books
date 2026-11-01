import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '../../app/login';
import { fakeClient, renderScreen } from '../render';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

describe('Login screen', () => {
  it('asks for a valid number, sends the code and verifies the OTP', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((_method, path) => {
      if (path === '/auth/otp/request') return { body: { phone: '9876543210', expiresInSeconds: 300, devHint: 'Use 123456 (demo code)' } };
      if (path === '/auth/otp/verify')
        return { body: { token: 'new-token', isNewUser: false, user: { id: 'u', name: 'Riya', phone: '9876543210', email: 'r@x.example', handle: 'r', avatar: null, createdAt: '' } } };
      return undefined;
    }, null);
    await renderScreen(<LoginScreen />, client);

    const cont = screen.getByRole('button', { name: 'Continue' });
    expect(cont).toBeDisabled();
    await user.type(screen.getByLabelText('Mobile number'), '98765abc43210');
    expect(cont).toBeEnabled();
    await user.press(cont);

    expect(await screen.findByText('Enter verification code')).toBeOnTheScreen();
    expect(screen.getByText('Sent to +91 98765 43210')).toBeOnTheScreen();
    expect(screen.getByText('Use 123456 (demo code)')).toBeOnTheScreen();

    await user.type(screen.getByTestId('otp-input'), '123456');
    await waitFor(() => expect(client.getToken()).toBe('new-token'));
    expect(calls.find((c) => c.path === '/auth/otp/verify')?.body).toEqual({ phone: '9876543210', code: '123456' });
    await act(async () => undefined);
  });

  it('shows an error for a wrong code', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/auth/otp/request') return { body: { phone: '9876543210', expiresInSeconds: 300, devHint: 'demo' } };
      if (path === '/auth/otp/verify') return { status: 400, body: { error: { code: 'INVALID_OTP', message: 'Wrong code' } } };
      return undefined;
    }, null);
    await renderScreen(<LoginScreen />, client);
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    await user.type(await screen.findByTestId('otp-input'), '111111');
    expect(await screen.findByText('That code is not right. Try again.')).toBeOnTheScreen();
  });
});
