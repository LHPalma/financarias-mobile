import { Pressable } from "react-native";
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
		<ThemedView className="flex-1 flex-row justify-center">
			<SafeAreaView
				className="flex-1 items-center justify-center px-four"
				style={{ paddingBottom: BottomTabInset + Spacing.three, maxWidth: MaxContentWidth }}
			>
				<HardShadowBox offset={4} borderRadius={0} className="p-three">
					<ThemedText type="title">Finançarias</ThemedText>
				</HardShadowBox>

				<Link href="/fuel" asChild>
					<Pressable className="mt-four">
						<ThemedText type="link">Ir para Combustíveis</ThemedText>
					</Pressable>
				</Link>

				<Pressable className="mt-four" onPress={toggleColorScheme}>
					<ThemedText type="link">
						Tema: {colorScheme === "dark" ? "escuro" : "claro"} (trocar)
					</ThemedText>
				</Pressable>
			</SafeAreaView>
		</ThemedView>
	);
}
