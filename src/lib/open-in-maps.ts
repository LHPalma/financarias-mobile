import { Linking, Platform } from "react-native";

import { toTitleCase } from "@/lib/text";

export type MapLocation = {
	name: string;
	municipality: string;
	state: string;
	// Endereço completo, quando disponível — nem toda query devolve os campos pra montar um (ver ethanolGasolineParity).
	address?: string | null;
};

function buildMapsQuery(location: MapLocation): string {
	const parts = [toTitleCase(location.name), location.address, `${toTitleCase(location.municipality)}/${location.state}`].filter(
		Boolean,
	);
	return parts.join(", ");
}

export async function openInMaps(location: MapLocation): Promise<void> {
	const query = encodeURIComponent(buildMapsQuery(location));
	const nativeUrl = Platform.select({
		ios: `maps:0,0?q=${query}`,
		android: `geo:0,0?q=${query}`,
	});
	const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

	if (nativeUrl && (await Linking.canOpenURL(nativeUrl))) {
		await Linking.openURL(nativeUrl);
		return;
	}

	await Linking.openURL(webUrl);
}
