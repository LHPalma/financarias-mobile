import { forwardRef } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType = 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

type ThemeColorMap = Record<ThemeColor, string>;

const LINK_PRIMARY_COLOR = '#3c87f7';

// Título/número em destaque em Archivo Black (font-display) — o traço visual central do
// brutalismo, sem tentar sintetizar outro peso: o arquivo já é a única variação que existe.
const TYPE_CLASSNAMES: Record<ThemedTextType, string> = {
  default: 'font-inter-medium text-[16px] leading-[24px]',
  title: 'font-display text-[40px] leading-[44px]',
  small: 'font-inter-medium text-[14px] leading-[20px]',
  smallBold: 'font-inter-bold text-[14px] leading-[20px]',
  subtitle: 'font-inter-bold text-[22px] leading-[28px]',
  link: 'font-inter-semibold text-[14px] leading-[30px]',
  linkPrimary: 'font-inter-semibold text-[14px] leading-[30px]',
};

/** Tipografia (família/tamanho/altura de linha) de um `type` do ThemedText, como className —
 * reaproveitada por componentes que não podem renderizar um <ThemedText> diretamente (ex.:
 * MarqueeText, que precisa de um <Text> de uma lib de terceiros por baixo). */
export function themedTextClassName(type: ThemedTextType = 'default', className?: string): string {
  return className ? `${TYPE_CLASSNAMES[type]} ${className}` : TYPE_CLASSNAMES[type];
}

/** Resolve a cor de um `type`+`themeColor` do ThemedText. Só a cor: ela continua vindo do JS
 * (`useTheme()`), enquanto a tipografia mora em `themedTextClassName`. */
export function resolveThemedTextStyle(
  theme: ThemeColorMap,
  type: ThemedTextType = 'default',
  themeColor?: ThemeColor,
): StyleProp<TextStyle> {
  return { color: type === 'linkPrimary' ? LINK_PRIMARY_COLOR : theme[themeColor ?? 'text'] };
}

export const ThemedText = forwardRef<Text, ThemedTextProps>(function ThemedText(
  { className, style, type = 'default', themeColor, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      className={themedTextClassName(type, className)}
      style={[resolveThemedTextStyle(theme, type, themeColor), style]}
      {...rest}
    />
  );
});
