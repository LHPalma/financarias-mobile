import { Colors } from '@/constants/theme';
import { useThemeOverride } from '@/hooks/theme-override';

export function useTheme() {
  const { colorScheme } = useThemeOverride();
  return Colors[colorScheme];
}
