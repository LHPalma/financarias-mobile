import { PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";

import { BorderWidth } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type HardShadowBoxProps = PropsWithChildren<{
	style?: ViewStyle;
	offset?: number;
	borderRadius?: number;
}>;

export function HardShadowBox({ children, style, offset = 8, borderRadius = 0 }: HardShadowBoxProps) {
	const theme = useTheme();

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
			<View
				style={[
					style,
					{
						borderWidth: BorderWidth.thick,
						borderColor: theme.text,
						backgroundColor: theme.backgroundElement,
						borderRadius,
					},
				]}
			>
				{children}
			</View>
		</View>
	);
}
