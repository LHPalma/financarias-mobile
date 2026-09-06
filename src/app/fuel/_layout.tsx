import { Stack } from "expo-router";

export default function FuelLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Combustível" }} />
			<Stack.Screen name="cheapest" options={{ title: "Postos mais baratos" }} />
			<Stack.Screen name="parity" options={{ title: "Etanol ou gasolina?" }} />
			<Stack.Screen name="brand-ranking" options={{ title: "Comparar por bandeira" }} />
			<Stack.Screen name="region-ranking" options={{ title: "Ranking por região" }} />
		</Stack>
	);
}
