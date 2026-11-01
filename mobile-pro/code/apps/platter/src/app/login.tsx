import { ApiError, formatPhone, isValidPhone, useRequestOtp, useVerifyOtp } from '@pro/api';
import { Art, Button, GradientFill, OtpInput, PressableScale, Text, TextField, useTheme, type ArtName } from '@pro/ui';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_ART: { art: ArtName; size: number; top: `${number}%`; left: `${number}%`; rotate: string }[] = [
  { art: 'sushi', size: 72, top: '10%', left: '8%', rotate: '-10deg' },
  { art: 'slice-of-pizza', size: 96, top: '8%', left: '64%', rotate: '14deg' },
  { art: 'curry-and-rice', size: 136, top: '26%', left: '30%', rotate: '-6deg' },
  { art: 'doughnut', size: 76, top: '50%', left: '6%', rotate: '10deg' },
  { art: 'hamburger', size: 104, top: '48%', left: '66%', rotate: '-8deg' },
]

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
          <GradientFill colors={colors.gradient} direction="vertical" />
          {HERO_ART.map((a) => (
            <View key={a.art} style={[styles.heroArt, { top: a.top, left: a.left, transform: [{ rotate: a.rotate }] }]}>
              <Art name={a.art} size={a.size} decorative />
            </View>
          ))}
          <View style={styles.brand}>
            <Text variant="display" color="onPrimary" accessibilityRole="header">
              platter
            </Text>
            <Text variant="headline" weight={500} color="onPrimary">
              Food you love, delivered fast
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 24 }]}>
          {step === 'phone' ? (
            <>
              <Text variant="title3" align="center">
                Log in or sign up
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
                By continuing, you agree to our Terms of Service and Privacy Policy
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
  hero: { flexGrow: 1, minHeight: 380, overflow: 'hidden', justifyContent: 'flex-end' },
  heroArt: { position: 'absolute' },
  brand: { padding: 24, paddingBottom: 48, gap: 2 },
  card: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  otpHead: { gap: 4 },
  sentTo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  center: { alignSelf: 'center' },
});
