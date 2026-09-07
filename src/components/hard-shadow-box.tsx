import { PropsWithChildren, useState } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type HardShadowBoxProps = PropsWithChildren<{
	className?: string;
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
	className,
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
		// minWidth/minHeight: 0 sobrescreve o "auto" padrão do flexbox/Yoga pra item de flex —
		// sem isso, este wrapper (que só encolhe pelo conteúdo do Card, nunca por si) se recusa a
		// encolher abaixo do tamanho intrínseco do conteúdo quando o Card usa w-full/flex-1 dentro
		// de um pai com largura/altura já definida, e a sombra (absoluta, do tamanho do wrapper)
		// estoura muito além do Card visível. Reproduzido tanto vertical (Limpar seleção dentro de
		// um flex-row) quanto horizontal (VintageWindowModal com w-full max-w-[340px]) — mesma causa.
		<View className="relative" style={{ marginRight: offset, marginBottom: offset, alignSelf, minWidth: 0, minHeight: 0 }}>
			<View
				className="absolute"
				style={{
					top: offset,
					left: offset,
					right: -offset,
					bottom: -offset,
					backgroundColor: theme.text,
					borderRadius,
				}}
			/>
			<Card
				className={className ? `border-thick ${className}` : "border-thick"}
				onPress={onPress}
				onPressIn={onPress ? () => setIsPressed(true) : undefined}
				onPressOut={onPress ? () => setIsPressed(false) : undefined}
				style={[
					{
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
