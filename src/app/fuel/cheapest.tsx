import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { FlatList, Linking, Platform, Pressable, StyleSheet, View } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { MarqueeText } from "@/components/marquee-text";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { VintageWindowModal } from "@/components/vintage-window-modal";
import { AccentColor, BorderWidth, CategoryColors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const FUEL_STATION_FIELDS = gql`
	fragment FuelStationFields on FuelStation {
		name
		brand
		municipality
		state
		street
		number
		complement
		neighborhood
		postalCode {
			value
		}
	}
`;

// Duas queries, não uma com $where opcional: quando o filtro vem como variável de um
// tipo genérico (FuelPriceFilterInput), o HotChocolate assume o pior caso de custo
// possível pra esse tipo (mesmo com valor null em runtime) e recusa a query
// (HC0047, "maximum allowed field cost exceeded"). Um `where` com a estrutura fixa
// na própria query (só a lista de estados vem por variável) calcula o custo real
// e passa — mas exige uma query sem o campo `where` pro caso "sem filtro".
const CHEAPEST_FUEL_PRICES = gql`
	${FUEL_STATION_FIELDS}
	query CheapestFuelPrices($product: FuelProduct!) {
		cheapestFuelPrices(product: $product, first: 20) {
			edges {
				node {
					id
					salePrice
					collectedOn
					fuelStation {
						...FuelStationFields
					}
				}
			}
		}
	}
`;

const CHEAPEST_FUEL_PRICES_BY_STATE = gql`
	${FUEL_STATION_FIELDS}
	query CheapestFuelPricesByState($product: FuelProduct!, $states: [String!]) {
		cheapestFuelPrices(product: $product, first: 20, where: { fuelStation: { state: { in: $states } } }) {
			edges {
				node {
					id
					salePrice
					collectedOn
					fuelStation {
						...FuelStationFields
					}
				}
			}
		}
	}
`;

type FuelPriceNode = {
	id: number;
	salePrice: number;
	collectedOn: string;
	fuelStation: {
		name: string;
		brand: string;
		municipality: string;
		state: string;
		street: string | null;
		number: string | null;
		complement: string | null;
		neighborhood: string | null;
		postalCode: { value: string } | null;
	};
};

type CheapestFuelPricesData = {
	cheapestFuelPrices: {
		edges: { node: FuelPriceNode }[];
	};
};

const FUEL_PRODUCTS = [
	{ label: "Gasolina", value: "GASOLINE" },
	{ label: "Etanol", value: "ETHANOL" },
	{ label: "Diesel", value: "DIESEL" },
] as const;

type FuelProductValue = (typeof FUEL_PRODUCTS)[number]["value"];

const BRAZILIAN_STATES = [
	{ code: "AC", name: "Acre" },
	{ code: "AL", name: "Alagoas" },
	{ code: "AP", name: "Amapá" },
	{ code: "AM", name: "Amazonas" },
	{ code: "BA", name: "Bahia" },
	{ code: "CE", name: "Ceará" },
	{ code: "DF", name: "Distrito Federal" },
	{ code: "ES", name: "Espírito Santo" },
	{ code: "GO", name: "Goiás" },
	{ code: "MA", name: "Maranhão" },
	{ code: "MT", name: "Mato Grosso" },
	{ code: "MS", name: "Mato Grosso do Sul" },
	{ code: "MG", name: "Minas Gerais" },
	{ code: "PA", name: "Pará" },
	{ code: "PB", name: "Paraíba" },
	{ code: "PR", name: "Paraná" },
	{ code: "PE", name: "Pernambuco" },
	{ code: "PI", name: "Piauí" },
	{ code: "RJ", name: "Rio de Janeiro" },
	{ code: "RN", name: "Rio Grande do Norte" },
	{ code: "RS", name: "Rio Grande do Sul" },
	{ code: "RO", name: "Rondônia" },
	{ code: "RR", name: "Roraima" },
	{ code: "SC", name: "Santa Catarina" },
	{ code: "SP", name: "São Paulo" },
	{ code: "SE", name: "Sergipe" },
	{ code: "TO", name: "Tocantins" },
] as const;

function toTitleCase(text: string): string {
	return text
		.toLowerCase()
		.split(" ")
		.map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
		.join(" ");
}

function formatAddress(station: FuelPriceNode["fuelStation"]): string | null {
	const streetLine = [station.street, station.number].filter(Boolean).join(", ");
	const parts = [streetLine, station.complement, station.neighborhood].filter(Boolean);

	if (station.postalCode?.value) {
		const cep = station.postalCode.value;
		parts.push(`CEP ${cep.slice(0, 5)}-${cep.slice(5)}`);
	}

	return parts.length > 0 ? toTitleCase(parts.join(" - ")) : null;
}

function buildMapsQuery(station: FuelPriceNode["fuelStation"]): string {
	const address = formatAddress(station);
	const parts = [toTitleCase(station.name), address, `${station.municipality}/${station.state}`].filter(Boolean);
	return parts.join(", ");
}

async function openInMaps(station: FuelPriceNode["fuelStation"]): Promise<void> {
	const query = encodeURIComponent(buildMapsQuery(station));
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

function regionChipLabel(selectedStates: string[]): string {
	if (selectedStates.length === 0) {
		return "Todos os estados";
	}

	if (selectedStates.length <= 2) {
		return selectedStates.join(", ");
	}

	return `${selectedStates.length} estados`;
}

export default function CheapestFuelPricesScreen() {
	const theme = useTheme();
	const [product, setProduct] = useState<FuelProductValue>("GASOLINE");
	const [selectedStation, setSelectedStation] = useState<FuelPriceNode | null>(null);
	const [selectedStates, setSelectedStates] = useState<string[]>([]);
	const [regionModalVisible, setRegionModalVisible] = useState(false);

	const hasStateFilter = selectedStates.length > 0;
	const { data, loading, error } = useQuery<CheapestFuelPricesData>(
		hasStateFilter ? CHEAPEST_FUEL_PRICES_BY_STATE : CHEAPEST_FUEL_PRICES,
		{
			variables: hasStateFilter ? { product, states: selectedStates } : { product },
		},
	);

	const prices = data?.cheapestFuelPrices.edges.map((edge: { node: FuelPriceNode }) => edge.node) ?? [];

	function toggleState(code: string) {
		setSelectedStates((current) =>
			current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
		);
	}

	return (
		<ThemedView style={styles.container}>
			<View style={styles.filters}>
				<View style={styles.chipRow}>
					{FUEL_PRODUCTS.map((item) => {
						const active = item.value === product;
						return (
							<HardShadowBox
								key={item.value}
								offset={3}
								onPress={() => setProduct(item.value)}
								style={[styles.chip, active && { backgroundColor: AccentColor }]}
							>
								<ThemedText type="smallBold">{item.label}</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>

				<View style={styles.chipRow}>
					<HardShadowBox
						offset={3}
						onPress={() => setRegionModalVisible(true)}
						style={[styles.chip, selectedStates.length > 0 && { backgroundColor: AccentColor }]}
					>
						<ThemedText type="smallBold">{regionChipLabel(selectedStates)}</ThemedText>
					</HardShadowBox>
				</View>
			</View>

			{loading && (
				<ThemedView style={styles.centered}>
					<ThemedText type="default">Carregando…</ThemedText>
				</ThemedView>
			)}

			{error && (
				<ThemedView style={styles.centered}>
					<ThemedText type="default">Erro ao carregar: {error.message}</ThemedText>
				</ThemedView>
			)}

			{!loading && !error && (
				<FlatList
					data={prices}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<Pressable
							style={[styles.row, { borderBottomColor: theme.text }]}
							onPress={() => setSelectedStation(item)}
						>
							<View style={styles.rowLeft}>
								<MarqueeText type="smallBold" style={styles.stationName}>
									{toTitleCase(item.fuelStation.name)}
								</MarqueeText>
								<View style={[styles.brandTag, { backgroundColor: CategoryColors.coral, borderColor: theme.text }]}>
									<ThemedText style={styles.brandTagText} numberOfLines={1}>
										{item.fuelStation.brand}
									</ThemedText>
								</View>
								<ThemedText type="small" themeColor="textSecondary" style={styles.address}>
									{item.fuelStation.municipality}/{item.fuelStation.state}
								</ThemedText>
							</View>

							<View style={styles.rowRight}>
								<ThemedText type="title" style={styles.price}>
									R$ {item.salePrice.toFixed(2)}
								</ThemedText>
								<ThemedText type="small" themeColor="textSecondary" style={styles.priceUnit}>
									R$/L
								</ThemedText>
							</View>
						</Pressable>
					)}
				/>
			)}

			<VintageWindowModal
				visible={selectedStation !== null}
				onClose={() => setSelectedStation(null)}
				title="Detalhes do posto"
			>
				{selectedStation && (
					<>
						<ThemedText type="subtitle">{toTitleCase(selectedStation.fuelStation.name)}</ThemedText>

						<View
							style={[
								styles.brandTag,
								styles.modalBrandTag,
								{ backgroundColor: CategoryColors.coral, borderColor: theme.text },
							]}
						>
							<ThemedText style={styles.brandTagText} numberOfLines={1}>
								{selectedStation.fuelStation.brand}
							</ThemedText>
						</View>

						<ThemedText type="default" style={styles.modalAddress}>
							{formatAddress(selectedStation.fuelStation) ?? "Endereço não informado"}
						</ThemedText>

						<ThemedText type="small" themeColor="textSecondary">
							{selectedStation.fuelStation.municipality}/{selectedStation.fuelStation.state}
						</ThemedText>

						<View style={styles.mapsButtonRow}>
							<HardShadowBox offset={3} style={styles.mapsButton} onPress={() => openInMaps(selectedStation.fuelStation)}>
								<ThemedText type="smallBold">📍 Ver no mapa</ThemedText>
							</HardShadowBox>
						</View>
					</>
				)}
			</VintageWindowModal>

			<VintageWindowModal
				visible={regionModalVisible}
				onClose={() => setRegionModalVisible(false)}
				title="Filtrar por estado"
				titleBarColor={CategoryColors.blue}
				contentStyle={styles.regionModalContent}
			>
				<View style={styles.regionGrid}>
					{BRAZILIAN_STATES.map((state) => {
						const active = selectedStates.includes(state.code);
						return (
							<HardShadowBox
								key={state.code}
								offset={2}
								onPress={() => toggleState(state.code)}
								style={[styles.stateChip, active && { backgroundColor: AccentColor }]}
							>
								<ThemedText type="smallBold">{state.code}</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>

				<View style={styles.mapsButtonRow}>
					<HardShadowBox
						offset={3}
						style={[styles.mapsButton, selectedStates.length === 0 && styles.disabledButton]}
						pressedStyle={{ backgroundColor: CategoryColors.coral }}
						onPress={selectedStates.length > 0 ? () => setSelectedStates([]) : undefined}
					>
						<ThemedText type="smallBold" themeColor={selectedStates.length > 0 ? "text" : "textSecondary"}>
							Limpar seleção
						</ThemedText>
					</HardShadowBox>
				</View>
			</VintageWindowModal>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	filters: {
		padding: Spacing.four,
		gap: Spacing.two,
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	chip: {
		paddingVertical: Spacing.one,
		paddingHorizontal: Spacing.three,
	},
	list: {
		paddingHorizontal: Spacing.four,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingVertical: Spacing.three,
		borderBottomWidth: BorderWidth.medium,
		gap: Spacing.two,
	},
	rowLeft: {
		flex: 1,
		gap: Spacing.half,
	},
	stationName: {
		fontSize: 13,
	},
	brandTag: {
		alignSelf: "flex-start",
		minWidth: 76,
		alignItems: "center",
		paddingVertical: 2,
		paddingHorizontal: Spacing.two,
		borderWidth: BorderWidth.thin,
	},
	brandTagText: {
		fontSize: 10,
		textAlign: "center",
		color: "#FFFFFF",
	},
	address: {
		fontSize: 10,
	},
	rowRight: {
		alignItems: "flex-end",
	},
	price: {
		fontSize: 18,
		lineHeight: 20,
	},
	priceUnit: {
		fontSize: 10,
	},
	modalBrandTag: {
		marginVertical: Spacing.half,
	},
	modalAddress: {
		marginTop: Spacing.two,
	},
	mapsButtonRow: {
		flexDirection: "row",
		marginTop: Spacing.three,
	},
	mapsButton: {
		paddingVertical: Spacing.one,
		paddingHorizontal: Spacing.three,
	},
	disabledButton: {
		opacity: 0.4,
	},
	regionModalContent: {
		minHeight: 0,
	},
	regionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: Spacing.two,
	},
	stateChip: {
		width: 44,
		alignItems: "center",
		paddingVertical: Spacing.one,
		paddingHorizontal: Spacing.two,
	},
});
