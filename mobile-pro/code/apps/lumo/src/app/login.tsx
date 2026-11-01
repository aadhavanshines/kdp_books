import { ApiError, formatPhone, isValidPhone, useRequestOtp, useVerifyOtp } from '@pro/api';
import {
  Button,
  OtpInput,
  PhotoScene,
  PressableScale,
  Text,
  TextField,
  composeScene,
  makeShadow,
  useTheme,
  type ArtName,
  type ArtToneName,
} from '@pro/ui';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '../components/Wordmark';

const HERO: { id: string; tone: ArtToneName; arts: ArtName[]; rotate: string; left: `${number}%`; top: number }[] = [
  { id: 'login-a', tone: 'sunset', arts: ['sunset-over-buildings', 'hot-beverage'], rotate: '-9deg', left: '7%', top: 36 },
  { id: 'login-c', tone: 'mint', arts: ['dog-face', 'red-heart'], rotate: '8deg', left: '51%', top: 30 },
  { id: 'login-b', tone: 'night', arts: ['camping', 'crescent-moon'], rotate: '-1deg', left: '28%', top: 70 },
];

const RESEND_SECONDS = 30;

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [resendIn, setResendIn] = useState(0);
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const phoneError =
    requestOtp.error instanceof ApiError ? requestOtp.error.message : requestOtp.error ? 'Could not send the code' : null;
  const codeError =
    verifyOtp.error instanceof ApiError
      ? verifyOtp.error.code === 'NETWORK'
        ? verifyOtp.error.message
        : 'That code is not right. Try again.'
      : null;

  const sendCode = () => {
    requestOtp.mutate(phone, {
      onSuccess: () => {
        setStep('otp');
        setCode('');
        setResendIn(RESEND_SECONDS);
      },
    });
  };
  const verify = (value: string) => verifyOtp.mutate({ phone, code: value });

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: colors.surface }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <View style={styles.fan} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {HERO.map((h) => (
              <View
                key={h.id}
                style={[styles.polaroid, makeShadow('lg', colors.shadow), { backgroundColor: colors.surface, left: h.left, top: h.top, transform: [{ rotate: h.rotate }] }]}
              >
                <PhotoScene seed={h.id} scene={composeScene(h.arts, h.id, h.tone)} radius={10} />
              </View>
            ))}
          </View>
          <View style={styles.brand}>
            <Wordmark size={40} variant="display" />
            <Text variant="headline" weight={500} color="textSecondary" align="center">
              Share the little moments with the people who matter
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 24 }]}>
          {step === 'phone' ? (
            <>
              <Text variant="title3" align="center">
                Log in to Lumo
              </Text>
              <TextField
                label="Mobile number"
                hideLabel
                prefix="+91"
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={10}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                onSubmitEditing={() => isValidPhone(phone) && sendCode()}
                error={phoneError}
                testID="phone-input"
              />
              <Button
                title="Continue"
                size="lg"
                fullWidth
                disabled={!isValidPhone(phone)}
                loading={requestOtp.isPending}
                onPress={sendCode}
              />
              <Text variant="caption" weight={400} color="textMuted" align="center">
                {"By continuing, you agree to Lumo's Terms of Use and Privacy Policy"}
              </Text>
            </>
          ) : (
            <>
              <View style={styles.otpHead}>
                <Text variant="title3" align="center">
                  Enter verification code
                </Text>
                <View style={styles.sentTo}>
                  <Text variant="footnote" color="textSecondary">
                    {`Sent to ${formatPhone(phone)}`}
                  </Text>
                  <PressableScale
                    onPress={() => {
                      setStep('phone');
                      verifyOtp.reset();
                    }}
                    accessibilityLabel="Change mobile number"
                    hitSlop={12}
                  >
                    <Text variant="footnote" weight={700} color="primary">
                      Edit
                    </Text>
                  </PressableScale>
                </View>
              </View>
              <OtpInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (verifyOtp.isError) verifyOtp.reset();
                }}
                onComplete={verify}
                error={!!codeError}
                autoFocus
                disabled={verifyOtp.isPending}
                testID="otp-input"
              />
              {codeError ? (
                <Text variant="footnote" weight={600} color="danger" align="center" accessibilityLiveRegion="polite">
                  {codeError}
                </Text>
              ) : (
                <Text variant="footnote" color="textMuted" align="center">
                  {requestOtp.data?.devHint ?? 'Demo code: 123456'}
                </Text>
              )}
              <Button
                title="Verify and continue"
                size="lg"
                fullWidth
                disabled={code.length < 6}
                loading={verifyOtp.isPending}
                onPress={() => verify(code)}
              />
              {resendIn > 0 ? (
                <Text variant="footnote" color="textMuted" align="center" tabular>
                  {`Resend code in 0:${String(resendIn).padStart(2, '0')}`}
                </Text>
              ) : (
                <Button title="Resend code" variant="ghost" onPress={sendCode} style={styles.center} />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { flexGrow: 1, minHeight: 420, justifyContent: 'flex-end' },
  fan: { height: 280, marginTop: 8 },
  polaroid: { position: 'absolute', width: '42%', padding: 6, paddingBottom: 22, borderRadius: 14 },
  brand: { paddingHorizontal: 24, paddingBottom: 24, gap: 8, alignItems: 'center' },
  card: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  otpHead: { gap: 4 },
  sentTo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  center: { alignSelf: 'center' },
});
