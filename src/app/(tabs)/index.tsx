import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { Link } from "expo-router";

export default function HomeScreen() {
	return (
		<ThemedView style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<ThemedText type="title">Finançarias</ThemedText>

				<Link href="/fuel" asChild>
					<Pressable style={styles.button}>
						<ThemedText type="link">Ir para Combustíveis</ThemedText>
					</Pressable>
				</Link>
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
