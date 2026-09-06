import { forwardRef } from 'react';
import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType = 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

type ThemeColorMap = Record<ThemeColor, string>;

/** Resolve o estilo (fonte/tamanho/cor) de um `type`+`themeColor` do ThemedText — reaproveitado por
 * componentes que não podem renderizar um <ThemedText> diretamente (ex.: MarqueeText, que precisa de um
 * <Text> de uma lib de terceiros por baixo). */
export function resolveThemedTextStyle(
  theme: ThemeColorMap,
  type: ThemedTextType = 'default',
  themeColor?: ThemeColor,
): StyleProp<TextStyle> {
  return [
    { color: theme[themeColor ?? 'text'] },
    type === 'default' && styles.default,
    type === 'title' && styles.title,
    type === 'small' && styles.small,
    type === 'smallBold' && styles.smallBold,
    type === 'subtitle' && styles.subtitle,
    type === 'link' && styles.link,
    type === 'linkPrimary' && styles.linkPrimary,
  ];
}

export const ThemedText = forwardRef<Text, ThemedTextProps>(function ThemedText(
  { style, type = 'default', themeColor, ...rest },
  ref,
) {
  const theme = useTheme();

  return <Text ref={ref} style={[resolveThemedTextStyle(theme, type, themeColor), style]} {...rest} />;
});

const styles = StyleSheet.create({
  small: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  // Título/número em destaque — o traço visual central do brutalismo (Archivo Black,
  // sem tentar sintetizar outro peso: o arquivo já é a única variação que existe).
  title: {
    fontFamily: Fonts.display,
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  link: {
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
});
