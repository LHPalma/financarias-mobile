import { ApolloProvider } from "@apollo/client";
import { ArchivoBlack_400Regular } from "@expo-google-fonts/archivo-black";
import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { apolloClient } from "@/lib/apollo-client";
import { ThemeOverrideProvider, useThemeOverride } from "@/hooks/theme-override";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		ArchivoBlack_400Regular,
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		Inter_800ExtraBold,
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<ApolloProvider client={apolloClient}>
			<ThemeOverrideProvider>
				<RootLayoutNav />
			</ThemeOverrideProvider>
		</ApolloProvider>
	);
}

function RootLayoutNav() {
	const { colorScheme } = useThemeOverride();

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="fuel" options={{ headerShown: false }} />
			</Stack>
		</ThemeProvider>
	);
}
