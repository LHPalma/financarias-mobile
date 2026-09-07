import { useQuery } from "@apollo/client";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { MarqueeText } from "@/components/marquee-text";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { VintageWindowModal } from "@/components/vintage-window-modal";
import { AccentColor, CategoryColors } from "@/constants/theme";
import { CheapestFuelPricesByStateDocument, CheapestFuelPricesDocument } from "@/generated/graphql";
import type { CheapestFuelPricesQuery } from "@/generated/graphql";
import { useTheme } from "@/hooks/use-theme";
import { openInMaps } from "@/lib/open-in-maps";
import { toTitleCase } from "@/lib/text";

// Duas queries (não $where opcional, que estoura custo HC0047 mesmo com null) — geradas de cheapest.graphql via `npm run codegen`, não editar graphql.ts na mão.

type FuelPriceNode = NonNullable<
	NonNullable<CheapestFuelPricesQuery["cheapestFuelPrices"]>["edges"]
>[number]["node"];

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

function formatAddress(station: FuelPriceNode["fuelStation"]): string | null {
	const streetLine = [station.street, station.number].filter(Boolean).join(", ");
	const parts = [streetLine, station.complement, station.neighborhood].filter(Boolean);

	if (station.postalCode?.value) {
		const cep = station.postalCode.value;
		parts.push(`CEP ${cep.slice(0, 5)}-${cep.slice(5)}`);
	}

	return parts.length > 0 ? toTitleCase(parts.join(" - ")) : null;
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

// style, não className: duas classes de font-size na mesma string empatam pela ordem da folha gerada, não pela ordem escrita.
const textOverrides = {
	stationName: { fontSize: 13 },
	brandTagText: { fontSize: 10, color: "#FFFFFF" },
	address: { fontSize: 10 },
	price: { fontSize: 18, lineHeight: 20 },
	priceUnit: { fontSize: 10 },
	regionModalContent: { minHeight: 0 },
	// smallBold (14px) quebra linha em códigos largos (AM/MA/MG/MT/MS/PA/PB) nos
	// 44px do chip em algumas fontes de device físico — a 2ª linha vaza pra fora
	// do card e aparece por cima da sombra do HardShadowBox atrás dele.
	stateChipText: { fontSize: 12, lineHeight: 14 },
} as const;

export default function CheapestFuelPricesScreen() {
	const theme = useTheme();
	const [product, setProduct] = useState<FuelProductValue>("GASOLINE");
	const [selectedStation, setSelectedStation] = useState<FuelPriceNode | null>(null);
	const [selectedStates, setSelectedStates] = useState<string[]>([]);
	const [regionModalVisible, setRegionModalVisible] = useState(false);

	const hasStateFilter = selectedStates.length > 0;
	const { data, loading, error } = useQuery(
		hasStateFilter ? CheapestFuelPricesByStateDocument : CheapestFuelPricesDocument,
		{
			variables: hasStateFilter ? { product, states: selectedStates } : { product },
		},
	);

	const prices = (data?.cheapestFuelPrices?.edges ?? []).map((edge: { node: FuelPriceNode }) => edge.node);

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
								onPress={() =>
									openInMaps({
										name: selectedStation.fuelStation.name,
										municipality: selectedStation.fuelStation.municipality,
										state: selectedStation.fuelStation.state,
										address: formatAddress(selectedStation.fuelStation),
									})
								}
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
								className="w-[44px] items-center px-one py-one"
								style={active ? { backgroundColor: AccentColor } : undefined}
							>
								<ThemedText type="smallBold" style={textOverrides.stateChipText} numberOfLines={1}>
									{state.code}
								</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>

				<View className="mt-three flex-row">
					<HardShadowBox
						offset={3}
						alignSelf="flex-start"
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
