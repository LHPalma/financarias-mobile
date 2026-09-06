import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { ThemedText } from "@/components/themed-text";
import { BorderWidth, CategoryColors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type VintageWindowModalProps = PropsWithChildren<{
	visible: boolean;
	onClose: () => void;
	title: string;
	titleBarColor?: string;
	contentStyle?: StyleProp<ViewStyle>;
}>;

export function VintageWindowModal({
	visible,
	onClose,
	title,
	titleBarColor = CategoryColors.mustard,
	contentStyle,
	children,
}: VintageWindowModalProps) {
	const theme = useTheme();

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable onPress={(event) => event.stopPropagation()}>
					<HardShadowBox offset={5} style={styles.windowShell}>
						<View style={[styles.titleBar, { backgroundColor: titleBarColor, borderBottomColor: theme.text }]}>
							<ThemedText type="smallBold" style={[styles.titleBarText, { color: theme.text }]} numberOfLines={1}>
								{title}
							</ThemedText>
							<Pressable
								style={[styles.closeBox, { backgroundColor: CategoryColors.coral, borderColor: theme.text }]}
								onPress={onClose}
							>
								<ThemedText style={[styles.closeX, { color: theme.background }]}>✕</ThemedText>
							</Pressable>
						</View>

						<View style={[styles.content, contentStyle]}>{children}</View>
					</HardShadowBox>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: Spacing.five,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	windowShell: {
		width: "100%",
		maxWidth: 340,
		padding: 0,
		overflow: "hidden",
	},
	titleBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		paddingVertical: Spacing.two,
		paddingHorizontal: Spacing.two,
		borderBottomWidth: BorderWidth.thick,
	},
	titleBarText: {
		flex: 1,
	},
	closeBox: {
		width: 18,
		height: 18,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: BorderWidth.thin,
	},
	closeX: {
		fontSize: 11,
		lineHeight: 12,
	},
	content: {
		padding: Spacing.four,
		gap: Spacing.two,
		minHeight: 210,
	},
});
