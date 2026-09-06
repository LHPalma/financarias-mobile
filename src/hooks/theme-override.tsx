import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ColorScheme = "light" | "dark";

type ThemeOverrideContextValue = {
	colorScheme: ColorScheme;
	toggleColorScheme: () => void;
};

const ThemeOverrideContext = createContext<ThemeOverrideContextValue | null>(null);

export function ThemeOverrideProvider({ children }: PropsWithChildren) {
	const systemScheme = useSystemColorScheme();
	const [override, setOverride] = useState<ColorScheme | null>(null);

	const colorScheme: ColorScheme = override ?? (systemScheme === "dark" ? "dark" : "light");

	function toggleColorScheme() {
		setOverride(colorScheme === "dark" ? "light" : "dark");
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
