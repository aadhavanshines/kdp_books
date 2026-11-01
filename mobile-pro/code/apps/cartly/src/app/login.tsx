import { ApiError, formatPhone, isValidPhone, useRequestOtp, useVerifyOtp } from '@pro/api';
import { Art, Button, GradientFill, Icon, OtpInput, PressableScale, Text, TextField, useTheme, type ArtName, type IoniconName } from '@pro/ui';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_ART: { art: ArtName; size: number; top: `${number}%`; left: `${number}%`; rotate: string }[] = [
  { art: 'headphone', size: 76, top: '10%', left: '6%', rotate: '-12deg' },
  { art: 'athletic-shoe', size: 92, top: '9%', left: '64%', rotate: '12deg' },
  { art: 'shopping-bags', size: 140, top: '25%', left: '30%', rotate: '-4deg' },
  { art: 'watch', size: 72, top: '50%', left: '6%', rotate: '10deg' },
  { art: 'mobile-phone', size: 96, top: '47%', left: '68%', rotate: '-10deg' },
];

const TRUST: { icon: IoniconName; label: string }[] = [
  { icon: 'shield-checkmark-outline', label: 'Secure payments' },
  { icon: 'refresh-outline', label: 'Easy returns' },
  { icon: 'ribbon-outline', label: 'Genuine products' },
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
          <GradientFill colors={colors.gradient} direction="vertical" />
          {HERO_ART.map((a) => (
            <View key={a.art} style={[styles.heroArt, { top: a.top, left: a.left, transform: [{ rotate: a.rotate }] }]}>
              <Art name={a.art} size={a.size} decorative />
            </View>
          ))}
          <View style={styles.brand}>
            <View style={styles.wordmark}>
              <Icon name="bag-handle" size={34} color="accent" />
              <Text variant="display" color="onPrimary" accessibilityRole="header">
                cartly
              </Text>
            </View>
            <Text variant="headline" weight={500} color="onPrimary">
              Big brands, bigger deals, delivered to your door
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
              <View style={styles.trust}>
                {TRUST.map((t) => (
                  <View key={t.label} style={styles.trustItem}>
                    <View style={[styles.trustIcon, { backgroundColor: colors.primarySoft }]}>
                      <Icon name={t.icon} size={18} color="primary" />
                    </View>
                    <Text variant="caption" color="textSecondary" align="center">
                      {t.label}
                    </Text>
                  </View>
                ))}
              </View>
              <Text variant="caption" weight={400} color="textMuted" align="center">
                {"By continuing, you agree to Cartly's Terms of Use and Privacy Policy"}
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
  brand: { padding: 24, paddingBottom: 48, gap: 4 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trust: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  trustItem: { flex: 1, alignItems: 'center', gap: 6 },
  trustIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  otpHead: { gap: 4 },
  sentTo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  center: { alignSelf: 'center' },
});
