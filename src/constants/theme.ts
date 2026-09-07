/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Paleta neo-brutalista: tinta/papel invertem entre os temas (preto sobre papel
// claro; papel sobre quase-preto), nunca um cinza médio nos extremos — é o que
// mantém a borda de 3px visível e o contraste alto nos dois temas. Acento e
// cores de categoria são as mesmas nos dois (já saturadas o bastante pra
// funcionar contra fundo claro ou escuro sem ajuste).
export const Colors = {
  light: {
    text: '#000000', // tinta
    background: '#F1E9D4', // papel — off-white quente, não branco puro
    backgroundElement: '#FFFFFF', // preenchimento de card, contrasta com o papel
    backgroundSelected: '#F5E400', // estado selecionado = acento, igual nos dois temas
    textSecondary: '#5A5850',
  },
  dark: {
    text: '#F1E9D4', // tinta clara — mesmo tom do papel do modo claro
    background: '#121212', // quase-preto, não preto puro
    backgroundElement: '#1E1E1E',
    backgroundSelected: '#F5E400',
    textSecondary: '#B5B2A8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const AccentColor = '#F5E400';

export const CategoryColors = {
  mustard: '#F2B705',
  green: '#1E8E5A',
  coral: '#E8563E',
  blue: '#3E7CB8',
} as const;

export const BorderWidth = {
  thick: 3, // frame, cards, botões, inputs
  medium: 2, // divisores, bordas secundárias
  thin: 1, // contorno de tag pequena
} as const;

export const Fonts = Platform.select({
  web: {
    display: "'Archivo Black', sans-serif",
    sans: "'Inter', sans-serif",
  },
  default: {
    display: 'ArchivoBlack_400Regular',
    sans: 'Inter_400Regular',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
