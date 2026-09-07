import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

type StateOption = { code: string; name: string };

function normalize(text: string): string {
	return text
		.normalize("NFD")
		.replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
		.toLowerCase()
		.trim();
}

function matchStateCode(states: readonly StateOption[], regionName: string | null | undefined): string | null {
	if (!regionName) {
		return null;
	}

	const normalized = normalize(regionName);
	const match = states.find((item) => normalize(item.name) === normalized || item.code.toLowerCase() === normalized);
	return match?.code ?? null;
}

/**
 * Detecta a UF do usuário pela localização do dispositivo, casando o `region`
 * do reverse-geocode contra a lista de estados passada. Só roda em nativo —
 * `reverseGeocodeAsync` não existe no preview web (`detecting` já nasce
 * `false` lá). Falha silenciosamente (permissão negada, sem GPS, sem match) —
 * quem consome decide o fallback.
 */
export function useDetectedState(states: readonly StateOption[]) {
	const [detectedState, setDetectedState] = useState<string | null>(null);
	const [detecting, setDetecting] = useState(Platform.OS !== "web");

	useEffect(() => {
		if (Platform.OS === "web") {
			return;
		}

		let cancelled = false;

		async function detect() {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					return;
				}

				const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
				const [place] = await Location.reverseGeocodeAsync(position.coords);
				const code = matchStateCode(states, place?.region);

				if (code && !cancelled) {
					setDetectedState(code);
				}
			} catch {
				// Localização indisponível/negada — consumidor cai pro fallback manual.
			} finally {
				if (!cancelled) {
					setDetecting(false);
				}
			}
		}

		detect();

		return () => {
			cancelled = true;
		};
	}, [states]);

	return { detectedState, detecting };
}
