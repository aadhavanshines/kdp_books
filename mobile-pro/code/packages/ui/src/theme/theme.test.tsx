import { ART_TONES } from '@pro/api/types';
import { render, screen } from '@testing-library/react-native';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Text as RNText } from 'react-native';

import { ART_NAMES } from '../art/registry';
import { ART_TONE_NAMES, BRAND_NAMES, brands } from '../tokens/colors';
import { createTheme, luminance, prefersDarkText, ratingColor } from './createTheme';
import { ThemeProvider, useTheme } from './ThemeProvider';

describe('createTheme', () => {
  it('uses the DESIGN.md brand colors on the shared neutrals', () => {
    expect(createTheme('platter').colors.primary).toBe('#FC5A1E');
    expect(createTheme('platter').colors.accent).toBe('#1BA672');
    expect(createTheme('cartly').colors.primary).toBe('#2453FF');
    expect(createTheme('cartly').colors.accent).toBe('#FFC21A');
    expect(createTheme('lumo').colors.gradient).toEqual(['#F58529', '#DD2A7B', '#8134AF']);
    expect(createTheme('lumo').colors.accent).toBe('#0095F6');
    expect(createTheme('minutely').colors.primary).toBe('#0C831F');
    expect(createTheme('minutely').colors.accent).toBe('#F8CB46');
    expect(createTheme('reelhouse').colors.primary).toBe('#7C5CFF');
    expect(createTheme('reelhouse').colors.accent).toBe('#22D3EE');

    const light = createTheme('platter', 'light').colors;
    expect(light.background).toBe('#F5F6F8');
    expect(light.surface).toBe('#FFFFFF');
  });

  it('has a light and a dark palette for every brand', () => {
    for (const brand of BRAND_NAMES) {
      expect(brands[brand].light.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(brands[brand].dark.primary).toMatch(/^#[0-9A-F]{6}$/i);
    }
    expect(createTheme('minutely', 'dark').colors.background).not.toBe(createTheme('minutely', 'light').colors.background);
  });

  it('keeps Reelhouse dark only', () => {
    const theme = createTheme('reelhouse', 'light');
    expect(theme.scheme).toBe('dark');
    expect(theme.colors.text).toBe(createTheme('platter', 'dark').colors.text);
  });

  it('never uses a red brand color for Reelhouse', () => {
    expect(createTheme('reelhouse').colors.primary.toUpperCase()).not.toBe('#E50914');
  });

  it('bands rating colors', () => {
    const { colors } = createTheme('platter');
    expect(ratingColor(4.4, colors)).toBe(colors.ratingHigh);
    expect(ratingColor(3.6, colors)).toBe(colors.ratingMid);
    expect(ratingColor(2.9, colors)).toBe(colors.ratingLow);
  });

  it('resolves art tones per scheme', () => {
    expect(createTheme('lumo', 'light').tone('sunset')).not.toEqual(createTheme('lumo', 'dark').tone('sunset'));
  });
});

describe('ThemeProvider', () => {
  function BrandProbe() {
    const theme = useTheme();
    return <RNText>{`${theme.brand}:${theme.scheme}:${theme.colors.primary}`}</RNText>;
  }

  it('provides the requested brand and scheme', async () => {
    await render(
      <ThemeProvider brand="minutely" scheme="dark">
        <BrandProbe />
      </ThemeProvider>,
    );
    expect(screen.getByText('minutely:dark:#22A33A')).toBeOnTheScreen();
  });

  it('falls back to Platter light without a provider', async () => {
    await render(<BrandProbe />);
    expect(screen.getByText('platter:light:#FC5A1E')).toBeOnTheScreen();
  });
});

describe('shared names', () => {
  it('keeps the art registry in sync with art/index.json', () => {
    const index: string[] = JSON.parse(readFileSync(join(__dirname, '../../art/index.json'), 'utf8'));
    expect([...ART_NAMES]).toEqual([...new Set(index)].sort());
  });

  it('defines a gradient for every art tone the API can send', () => {
    expect([...ART_TONE_NAMES].sort()).toEqual([...ART_TONES].sort());
  });
});

describe('text over art tones', () => {
  it('measures luminance', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1);
    expect(luminance('#000000')).toBe(0);
  });

  it('picks dark text on pastels and white on deep gradients', () => {
    expect(prefersDarkText(['#FBC2EB', '#A6C1EE'])).toBe(true);
    expect(prefersDarkText(['#4B6CB7', '#182848'])).toBe(false);
    const light = createTheme('cartly', 'light');
    expect(light.onTone('candy')).toBe('text');
    expect(light.onTone('mint')).toBe('text');
    expect(light.onTone('dusk')).toBe('textInverse');
    expect(light.onTone('night')).toBe('textInverse');
  });
});
