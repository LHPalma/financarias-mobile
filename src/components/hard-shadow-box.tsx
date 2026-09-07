import { PropsWithChildren, useCallback, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, View, ViewStyle } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type CardSize = { width: number; height: number };

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
	const [cardSize, setCardSize] = useState<CardSize | null>(null);
	// Cast pragmático: quando onPress não existe usamos View (sem overhead de toque), mas
	// tipar Card como União View|Pressable trava onPressIn/onPressOut (View não os tem) mesmo
	// quando passados como undefined nesse branch.
	const Card = (onPress ? Pressable : View) as typeof Pressable;

	const handleCardLayout = useCallback((event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setCardSize((current) =>
			current && current.width === width && current.height === height ? current : { width, height },
		);
	}, []);

	return (
		<View style={{ marginRight: offset, marginBottom: offset, alignSelf }}>
			{/* A sombra recebe largura/altura medidas do Card em vez de se dimensionar sozinha pelos
			    insets (top/left/right/bottom) do wrapper: o wrapper é dimensionado pelo conteúdo, então
			    quando o Card depende do wrapper pra própria largura (width em %) os dois são resolvidos
			    em passadas diferentes do Yoga e podem divergir — a sombra saía com tamanho sem relação
			    com o card. Medindo, ela é sempre exatamente a caixa do Card deslocada em `offset`. */}
			{cardSize ? (
				<View
					className="absolute"
					style={{
						top: offset,
						left: offset,
						width: cardSize.width,
						height: cardSize.height,
						backgroundColor: theme.text,
						borderRadius,
					}}
				/>
			) : null}
			<Card
				className={className ? `border-thick ${className}` : "border-thick"}
				onLayout={handleCardLayout}
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
