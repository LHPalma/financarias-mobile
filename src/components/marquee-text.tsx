import { cssInterop } from "nativewind";
import { ComponentProps, ComponentType, Ref, useRef } from "react";
import { Pressable, ViewStyle } from "react-native";
import TextTicker, { TextTickerRef } from "react-native-text-ticker";

import { resolveThemedTextStyle, themedTextClassName, ThemedTextProps } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

type MarqueeTextProps = ThemedTextProps & {
	containerClassName?: string;
	containerStyle?: ViewStyle;
};

// O .d.ts da lib não declara startAnimation/stopAnimation na classe TextTicker,
// só na interface TextTickerRef à parte — a instância real tem os dois métodos.
type TextTickerInstance = TextTicker & TextTickerRef;

// TextTicker é de terceiros e não entende `className`; cssInterop registra o mapeamento
// className → style pra ele receber a mesma tipografia que o ThemedText. O retorno tipado
// da lib é um ComponentType sem ref — recuperamos o ref (usado pra disparar a animação).
const StyledTextTicker = cssInterop(TextTicker, { className: "style" }) as ComponentType<
	ComponentProps<typeof TextTicker> & { className?: string; ref?: Ref<TextTickerInstance> }
>;

export function MarqueeText({
	containerClassName,
	containerStyle,
	className,
	style,
	type,
	themeColor,
	...rest
}: MarqueeTextProps) {
	const theme = useTheme();
	const ref = useRef<TextTickerInstance>(null);

	return (
		<Pressable className={containerClassName} style={containerStyle} onPress={() => ref.current?.startAnimation()}>
			<StyledTextTicker
				ref={ref}
				className={themedTextClassName(type, className)}
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
