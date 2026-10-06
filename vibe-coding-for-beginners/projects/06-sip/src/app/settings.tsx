import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSip } from '@/lib/store';
import { DEFAULT_GOAL_ML, MAX_GOAL_ML, MIN_GOAL_ML, parseGoal } from '@/lib/water';
import { Colors, MIN_TARGET, useColors } from '@/theme';

export default function SettingsScreen() {
  const c = useColors();
  const s = styles(c);
  const router = useRouter();
  const { goal, setGoal } = useSip();
  const [text, setText] = useState(String(goal));
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const parsed = parseGoal(text);
    if (parsed === null) {
      setError(`Enter a whole number from ${MIN_GOAL_ML} to ${MAX_GOAL_ML} ml.`);
      return;
    }
    setGoal(parsed);
    router.back();
  };

  return (
    <>
      <Head>
        <title>Sip – Settings</title>
      </Head>
      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={s.label} nativeID="goal-label">
          Daily goal (ml)
        </Text>
        <TextInput
          style={[s.input, error ? s.inputError : null]}
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(null);
          }}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={save}
          accessibilityLabel="Daily goal in millilitres"
          accessibilityHint={`Whole number from ${MIN_GOAL_ML} to ${MAX_GOAL_ML}`}
          placeholderTextColor={c.textSecondary}
          placeholder={String(DEFAULT_GOAL_ML)}
        />
        {error ? (
          <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {error}
          </Text>
        ) : null}

        <View style={s.buttons}>
          <Pressable
            style={({ pressed }) => [s.primary, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Save goal"
            onPress={save}
          >
            <Text style={s.primaryText}>Save</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.secondary, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Reset goal to ${DEFAULT_GOAL_ML} millilitres`}
            onPress={() => {
              setText(String(DEFAULT_GOAL_ML));
              setError(null);
            }}
          >
            <Text style={s.secondaryText}>Reset to {DEFAULT_GOAL_ML} ml</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
    label: { color: c.text, fontSize: 18, fontWeight: '600' },
    input: {
      minHeight: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
      color: c.text,
      fontSize: 24,
      paddingHorizontal: 16,
    },
    inputError: { borderColor: c.danger },
    error: { color: c.danger, fontSize: 16 },
    buttons: { gap: 12, marginTop: 8 },
    primary: {
      minHeight: 56,
      borderRadius: 14,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: { color: c.onPrimary, fontSize: 18, fontWeight: '700' },
    secondary: {
      minHeight: MIN_TARGET + 8,
      borderRadius: 14,
      backgroundColor: c.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: { color: c.onSecondary, fontSize: 17, fontWeight: '600' },
    pressed: { opacity: 0.75 },
  });
