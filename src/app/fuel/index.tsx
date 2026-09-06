import { StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function FuelHubScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Combustíveis</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
