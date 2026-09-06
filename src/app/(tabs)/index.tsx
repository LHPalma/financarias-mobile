import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { Link } from "expo-router";
import { HardShadowBox } from "@/components/hard-shadow-box";
import { useThemeOverride } from "@/hooks/theme-override";

export default function HomeScreen() {
	const { colorScheme, toggleColorScheme } = useThemeOverride();

	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<HardShadowBox offset={4} borderRadius={0} style={{ padding: Spacing.three }}>
					<ThemedText type="title">Finançarias</ThemedText>
				</HardShadowBox>

				<Link href="/fuel" asChild>
					<Pressable style={styles.button}>
						<ThemedText type="link">Ir para Combustíveis</ThemedText>
					</Pressable>
				</Link>

				<Pressable style={styles.button} onPress={toggleColorScheme}>
					<ThemedText type="link">
						Tema: {colorScheme === "dark" ? "escuro" : "claro"} (trocar)
					</ThemedText>
				</Pressable>
			</SafeAreaView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		flexDirection: "row",
	},
	safeArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: Spacing.four,
		paddingBottom: BottomTabInset + Spacing.three,
		maxWidth: MaxContentWidth,
	},
	button: {
		marginTop: Spacing.four,
	},
});
