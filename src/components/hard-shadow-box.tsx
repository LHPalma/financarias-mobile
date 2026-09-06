import { PropsWithChildren, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";

import { BorderWidth } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type HardShadowBoxProps = PropsWithChildren<{
	style?: StyleProp<ViewStyle>;
	offset?: number;
	borderRadius?: number;
	onPress?: () => void;
	/** Aplica também no wrapper externo (que carrega a sombra) — passar alignSelf só em `style`
	 * encolhe/move o conteúdo sem acompanhar a sombra, que fica presa ao tamanho do pai. */
	alignSelf?: ViewStyle["alignSelf"];
	/** Estilo aplicado só enquanto o dedo está em cima (antes de soltar) — feedback tátil de toque.
	 * Só tem efeito junto com onPress. */
	pressedStyle?: StyleProp<ViewStyle>;
}>;

export function HardShadowBox({
	children,
	style,
	offset = 8,
	borderRadius = 0,
	onPress,
	alignSelf,
	pressedStyle,
}: HardShadowBoxProps) {
	const theme = useTheme();
	const [isPressed, setIsPressed] = useState(false);
	// Cast pragmático: quando onPress não existe usamos View (sem overhead de toque), mas
	// tipar Card como União View|Pressable trava onPressIn/onPressOut (View não os tem) mesmo
	// quando passados como undefined nesse branch.
	const Card = (onPress ? Pressable : View) as typeof Pressable;

	return (
		<View style={{ position: "relative", marginRight: offset, marginBottom: offset, alignSelf }}>
			<View
				style={{
					position: "absolute",
					top: offset,
					left: offset,
					right: -offset,
					bottom: -offset,
					backgroundColor: theme.text,
					borderRadius,
				}}
			/>
			<Card
				onPress={onPress}
				onPressIn={onPress ? () => setIsPressed(true) : undefined}
				onPressOut={onPress ? () => setIsPressed(false) : undefined}
				style={[
					{
						borderWidth: BorderWidth.thick,
						borderColor: theme.text,
						backgroundColor: theme.backgroundElement,
						borderRadius,
					},
					style,
					isPressed && pressedStyle,
				]}
			>
				{children}
			</Card>
		</View>
	);
}
