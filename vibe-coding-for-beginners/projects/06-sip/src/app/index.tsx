import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatMl, percentOfGoal, progressFraction } from '@/lib/water';
import { useSip } from '@/lib/store';
import { Colors, MIN_TARGET, useColors } from '@/theme';

function dayLabel(date: Date, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const c = useColors();
  const s = styles(c);
  const router = useRouter();
  const { loaded, goal, todayTotal, canUndo, history, log, undo } = useSip();

  const pct = percentOfGoal(todayTotal, goal);
  const fraction = progressFraction(todayTotal, goal);

  const announce = (message: string) => {
    // Android reads the live region below; iOS needs an explicit announcement.
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  };

  const onLog = (amount: number) => {
    log(amount);
    announce(`Added ${amount} millilitres. Total ${formatMl(todayTotal + amount)}.`);
  };

  const onUndo = () => {
    undo();
    announce('Last drink removed.');
  };

  return (
    <>
      <Head>
        <title>Sip – Water Tracker</title>
      </Head>
      <ScrollView
        style={s.screen}
        contentContainerStyle={s.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={s.card}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Today's progress"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.min(100, pct),
            text: `${formatMl(todayTotal)} of ${formatMl(goal)}, ${pct} percent`,
          }}
          accessibilityLiveRegion="polite"
        >
          <Text style={s.caption}>Today</Text>
          <Text style={s.amount}>{loaded ? formatMl(todayTotal) : '…'}</Text>
          <Text style={s.caption}>
            of {formatMl(goal)} goal · {pct}%
          </Text>
          <View
            style={s.track}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <View style={[s.fill, { width: `${fraction * 100}%` }]} />
          </View>
        </View>

        <View style={s.buttonRow}>
          <Pressable
            style={({ pressed }) => [s.bigButton, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel="+250 ml"
            accessibilityHint="Adds 250 millilitres to today's total"
            onPress={() => onLog(250)}
          >
            <Text style={s.bigButtonText}>+250 ml</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.bigButton, pressed && s.pressed]}
            accessibilityRole="button"
            accessibilityLabel="+500 ml"
            accessibilityHint="Adds 500 millilitres to today's total"
            onPress={() => onLog(500)}
          >
            <Text style={s.bigButtonText}>+500 ml</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            s.undo,
            !canUndo && s.undoDisabled,
            pressed && canUndo && s.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Undo last"
          accessibilityHint="Removes the most recent amount logged today"
          accessibilityState={{ disabled: !canUndo }}
          disabled={!canUndo}
          onPress={onUndo}
        >
          <Text style={[s.undoText, !canUndo && s.undoTextDisabled]}>Undo last</Text>
        </Pressable>

        <Text style={s.heading} accessibilityRole="header">
          Last 7 days
        </Text>
        <View style={s.card}>
          {history.map((day, i) => (
            <View
              key={day.key}
              style={[s.row, i > 0 && s.rowBorder]}
              accessible
              accessibilityLabel={`${dayLabel(day.date, i)}: ${day.total} millilitres`}
            >
              <Text style={s.rowLabel}>{dayLabel(day.date, i)}</Text>
              <Text style={s.rowValue}>{formatMl(day.total)}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [s.settings, pressed && s.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Settings, goal ${formatMl(goal)}`}
          accessibilityHint="Change your daily goal"
          onPress={() => router.push('/settings')}
        >
          <Text style={s.settingsText}>Settings · Goal {formatMl(goal)}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 16,
    },
    caption: { color: c.textSecondary, fontSize: 16 },
    amount: { color: c.text, fontSize: 44, fontWeight: '700', marginVertical: 4 },
    track: {
      height: 16,
      borderRadius: 8,
      backgroundColor: c.track,
      overflow: 'hidden',
      marginTop: 12,
    },
    fill: { height: '100%', borderRadius: 8, backgroundColor: c.primary },
    buttonRow: { flexDirection: 'row', gap: 12 },
    bigButton: {
      flex: 1,
      minHeight: 96,
      borderRadius: 20,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bigButtonText: { color: c.onPrimary, fontSize: 28, fontWeight: '700' },
    pressed: { opacity: 0.75 },
    undo: {
      minHeight: MIN_TARGET + 8,
      borderRadius: 14,
      backgroundColor: c.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    undoDisabled: { backgroundColor: c.disabled },
    undoText: { color: c.onSecondary, fontSize: 18, fontWeight: '600' },
    undoTextDisabled: { color: c.onDisabled },
    heading: { color: c.text, fontSize: 22, fontWeight: '700', marginTop: 8 },
    row: {
      minHeight: MIN_TARGET,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    rowLabel: { color: c.text, fontSize: 17 },
    rowValue: { color: c.text, fontSize: 17, fontWeight: '600' },
    settings: { minHeight: MIN_TARGET, alignItems: 'center', justifyContent: 'center' },
    settingsText: { color: c.primary, fontSize: 17, fontWeight: '600' },
  });
