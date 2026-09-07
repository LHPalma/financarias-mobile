import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

type ColorScheme = "light" | "dark";

type ThemeOverrideContextValue = {
	colorScheme: ColorScheme;
	toggleColorScheme: () => void;
};

const STORAGE_KEY = "financarias:colorScheme";

const ThemeOverrideContext = createContext<ThemeOverrideContextValue | null>(null);

export function ThemeOverrideProvider({ children }: PropsWithChildren) {
	// Padrão claro quando não há preferência salva — não segue o tema do sistema.
	const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
			if (stored === "light" || stored === "dark") {
				setColorScheme(stored);
			}
			setIsLoaded(true);
		});
	}, []);

	function toggleColorScheme() {
		const next = colorScheme === "dark" ? "light" : "dark";
		setColorScheme(next);
		AsyncStorage.setItem(STORAGE_KEY, next);
	}

	if (!isLoaded) {
		return null;
	}

	return (
		<ThemeOverrideContext.Provider value={{ colorScheme, toggleColorScheme }}>
			{children}
		</ThemeOverrideContext.Provider>
	);
}

export function useThemeOverride() {
	const context = useContext(ThemeOverrideContext);
	if (!context) {
		throw new Error("useThemeOverride must be used within a ThemeOverrideProvider");
	}
	return context;
}
