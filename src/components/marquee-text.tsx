import { useRef } from "react";
import { Pressable, ViewStyle } from "react-native";
import TextTicker, { TextTickerRef } from "react-native-text-ticker";

import { resolveThemedTextStyle, ThemedTextProps } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

type MarqueeTextProps = ThemedTextProps & {
	containerStyle?: ViewStyle;
};

// O .d.ts da lib não declara startAnimation/stopAnimation na classe TextTicker,
// só na interface TextTickerRef à parte — a instância real tem os dois métodos.
type TextTickerInstance = TextTicker & TextTickerRef;

export function MarqueeText({ containerStyle, style, type, themeColor, ...rest }: MarqueeTextProps) {
	const theme = useTheme();
	const ref = useRef<TextTickerInstance>(null);

	return (
		<Pressable style={containerStyle} onPress={() => ref.current?.startAnimation()}>
			<TextTicker
				ref={ref}
				style={[resolveThemedTextStyle(theme, type, themeColor), style]}
				marqueeOnMount={false}
				animationType="bounce"
				bounceSpeed={60}
				bounceDelay={600}
				{...rest}
			/>
		</Pressable>
	);
}
