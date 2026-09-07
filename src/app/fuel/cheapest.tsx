import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { FlatList, Linking, Platform, Pressable, View } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { MarqueeText } from "@/components/marquee-text";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { VintageWindowModal } from "@/components/vintage-window-modal";
import { AccentColor, CategoryColors } from "@/constants/theme";
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

// Ajustes que sobrescrevem o `type` do ThemedText ficam em `style`, não em className: duas
// utilitárias de font-size na mesma className seriam desempatadas pela ordem da folha gerada,
// não pela ordem escrita — enquanto `style` inline vence className por especificidade.
const textOverrides = {
	stationName: { fontSize: 13 },
	brandTagText: { fontSize: 10, color: "#FFFFFF" },
	address: { fontSize: 10 },
	price: { fontSize: 18, lineHeight: 20 },
	priceUnit: { fontSize: 10 },
	regionModalContent: { minHeight: 0 },
} as const;

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
		<ThemedView className="flex-1">
			<View className="gap-two p-four">
				<View className="flex-row flex-wrap gap-two">
					{FUEL_PRODUCTS.map((item) => {
						const active = item.value === product;
						return (
							<HardShadowBox
								key={item.value}
								offset={3}
								onPress={() => setProduct(item.value)}
								className="px-three py-one"
								style={active ? { backgroundColor: AccentColor } : undefined}
							>
								<ThemedText type="smallBold">{item.label}</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>

				<View className="flex-row flex-wrap gap-two">
					<HardShadowBox
						offset={3}
						onPress={() => setRegionModalVisible(true)}
						className="px-three py-one"
						style={selectedStates.length > 0 ? { backgroundColor: AccentColor } : undefined}
					>
						<ThemedText type="smallBold">{regionChipLabel(selectedStates)}</ThemedText>
					</HardShadowBox>
				</View>
			</View>

			{loading && (
				<ThemedView className="flex-1 items-center justify-center">
					<ThemedText type="default">Carregando…</ThemedText>
				</ThemedView>
			)}

			{error && (
				<ThemedView className="flex-1 items-center justify-center">
					<ThemedText type="default">Erro ao carregar: {error.message}</ThemedText>
				</ThemedView>
			)}

			{!loading && !error && (
				<FlatList
					data={prices}
					keyExtractor={(item) => String(item.id)}
					contentContainerClassName="px-four"
					renderItem={({ item }) => (
						<Pressable
							className="flex-row items-start justify-between gap-two border-b-medium py-three"
							style={{ borderBottomColor: theme.text }}
							onPress={() => setSelectedStation(item)}
						>
							<View className="flex-1 gap-half">
								<MarqueeText type="smallBold" style={textOverrides.stationName}>
									{toTitleCase(item.fuelStation.name)}
								</MarqueeText>
								<View
									className="min-w-[76px] items-center self-start border-thin px-two py-half"
									style={{ backgroundColor: CategoryColors.coral, borderColor: theme.text }}
								>
									<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
										{item.fuelStation.brand}
									</ThemedText>
								</View>
								<ThemedText type="small" themeColor="textSecondary" style={textOverrides.address}>
									{item.fuelStation.municipality}/{item.fuelStation.state}
								</ThemedText>
							</View>

							<View className="items-end">
								<ThemedText type="title" style={textOverrides.price}>
									R$ {item.salePrice.toFixed(2)}
								</ThemedText>
								<ThemedText type="small" themeColor="textSecondary" style={textOverrides.priceUnit}>
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
							className="my-half min-w-[76px] items-center self-start border-thin px-two py-half"
							style={{ backgroundColor: CategoryColors.coral, borderColor: theme.text }}
						>
							<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
								{selectedStation.fuelStation.brand}
							</ThemedText>
						</View>

						<ThemedText type="default" className="mt-two">
							{formatAddress(selectedStation.fuelStation) ?? "Endereço não informado"}
						</ThemedText>

						<ThemedText type="small" themeColor="textSecondary">
							{selectedStation.fuelStation.municipality}/{selectedStation.fuelStation.state}
						</ThemedText>

						<View className="mt-three flex-row">
							<HardShadowBox
								offset={3}
								className="px-three py-one"
								onPress={() => openInMaps(selectedStation.fuelStation)}
							>
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
				contentStyle={textOverrides.regionModalContent}
			>
				<View className="flex-row flex-wrap justify-center gap-two">
					{BRAZILIAN_STATES.map((state) => {
						const active = selectedStates.includes(state.code);
						return (
							<HardShadowBox
								key={state.code}
								offset={2}
								onPress={() => toggleState(state.code)}
								className="w-[44px] items-center px-two py-one"
								style={active ? { backgroundColor: AccentColor } : undefined}
							>
								<ThemedText type="smallBold">{state.code}</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>

				<View className="mt-three flex-row">
					<HardShadowBox
						offset={3}
						className={selectedStates.length === 0 ? "px-three py-one opacity-40" : "px-three py-one"}
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
