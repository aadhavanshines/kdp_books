import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

/** Font assets every app loads before hiding the splash screen. */
export const proFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  ...Ionicons.font,
  ...MaterialCommunityIcons.font,
};

/** Loads Inter (400 to 800) and the icon fonts. Returns [loaded, error]. */
export function useProFonts(): [boolean, Error | null] {
  return useFonts(proFonts);
}
