import { Stack } from "expo-router";

export default function FuelLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Combustível" }} />
		</Stack>
	);
}
