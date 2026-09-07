/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			// Mesmos nomes e valores de `Spacing` (src/constants/theme.ts) — p-three é 16px lá e aqui.
			spacing: {
				half: 2,
				one: 4,
				two: 8,
				three: 16,
				four: 24,
				five: 32,
				six: 64,
			},
			// Mesmos nomes e valores de `BorderWidth` (src/constants/theme.ts).
			borderWidth: {
				thick: 3,
				medium: 2,
				thin: 1,
			},
			// Nomes das famílias carregadas em `useFonts` (src/app/_layout.tsx). Os pesos do Inter
			// são prefixados com `inter-` porque `font-bold`/`font-medium`/`font-semibold` já são
			// utilitários de font-weight do Tailwind — reusar esses nomes geraria duas regras `.font-bold`.
			fontFamily: {
				display: "ArchivoBlack_400Regular",
				sans: "Inter_400Regular",
				"inter-medium": "Inter_500Medium",
				"inter-semibold": "Inter_600SemiBold",
				"inter-bold": "Inter_700Bold",
				"inter-extrabold": "Inter_800ExtraBold",
			},
		},
	},
	plugins: [],
};
