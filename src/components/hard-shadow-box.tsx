import { PropsWithChildren } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";

import { BorderWidth } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type HardShadowBoxProps = PropsWithChildren<{
	style?: StyleProp<ViewStyle>;
	offset?: number;
	borderRadius?: number;
	onPress?: () => void;
}>;

export function HardShadowBox({ children, style, offset = 8, borderRadius = 0, onPress }: HardShadowBoxProps) {
	const theme = useTheme();
	const Card = onPress ? Pressable : View;

	return (
		<View style={{ position: "relative", marginRight: offset, marginBottom: offset }}>
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
				style={[
					{
						borderWidth: BorderWidth.thick,
						borderColor: theme.text,
						backgroundColor: theme.backgroundElement,
						borderRadius,
					},
					style,
				]}
			>
				{children}
			</Card>
		</View>
	);
}
