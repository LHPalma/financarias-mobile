import { useQuery } from "@apollo/client";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { MarqueeText } from "@/components/marquee-text";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { VintageWindowModal } from "@/components/vintage-window-modal";
import { AccentColor, CategoryColors } from "@/constants/theme";
import { EthanolGasolineParityByStateDocument } from "@/generated/graphql";
import type { EthanolGasolineParityByStateQuery } from "@/generated/graphql";
import { useDetectedState } from "@/hooks/use-detected-state";
import { useTheme } from "@/hooks/use-theme";
import { openInMaps } from "@/lib/open-in-maps";
import { toTitleCase } from "@/lib/text";

type ParityNode = NonNullable<
	NonNullable<EthanolGasolineParityByStateQuery["ethanolGasolineParity"]>["edges"]
>[number]["node"];

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

// style, não className: mesma regra de cheapest.tsx — duas classes de font-size na
// mesma string empatam pela ordem da folha gerada, não pela ordem escrita.
const textOverrides = {
	stationName: { fontSize: 13 },
	brandTagText: { fontSize: 10, color: "#FFFFFF" },
	address: { fontSize: 10 },
	price: { fontSize: 14, lineHeight: 17 },
	priceUnit: { fontSize: 9 },
	stateModalContent: { minHeight: 0 },
	stationModalContent: { minHeight: 0 },
	// smallBold (14px) quebra linha em códigos largos (AM/MA/MG/MT/MS/PA/PB) nos
	// 44px do chip em algumas fontes de device físico — a 2ª linha vaza pra fora
	// do card e aparece por cima da sombra do HardShadowBox atrás dele.
	stateChipText: { fontSize: 12, lineHeight: 14 },
} as const;

export default function EthanolGasolineParityScreen() {
	const theme = useTheme();
	// null = usuário não escolheu manualmente ainda; nesse caso `detectedState` decide.
	const [manualState, setManualState] = useState<string | null>(null);
	const [stateModalVisible, setStateModalVisible] = useState(false);
	const [selectedStation, setSelectedStation] = useState<ParityNode | null>(null);
	const { detectedState, detecting: detectingLocation } = useDetectedState(BRAZILIAN_STATES);
	const selectedState = manualState ?? detectedState;

	const { data, loading, error } = useQuery(EthanolGasolineParityByStateDocument, {
		variables: { state: selectedState ?? "" },
		skip: selectedState === null,
	});

	const parities = (data?.ethanolGasolineParity?.edges ?? []).map((edge: { node: ParityNode }) => edge.node);

	return (
		<ThemedView className="flex-1">
			<View className="gap-two p-four">
				<View className="flex-row flex-wrap gap-two">
					<HardShadowBox
						offset={3}
						onPress={() => setStateModalVisible(true)}
						className="px-three py-one"
						style={selectedState !== null ? { backgroundColor: AccentColor } : undefined}
					>
						<ThemedText type="smallBold">{selectedState ?? "Escolher estado"}</ThemedText>
					</HardShadowBox>
				</View>
			</View>

			{selectedState === null && (
				<ThemedView className="flex-1 items-center justify-center p-four">
					<ThemedText type="default" className="text-center" themeColor="textSecondary">
						{detectingLocation
							? "Detectando sua localização…"
							: "Escolha um estado pra ver o ranking de postos por vantagem do etanol."}
					</ThemedText>
				</ThemedView>
			)}

			{selectedState !== null && loading && (
				<ThemedView className="flex-1 items-center justify-center">
					<ThemedText type="default">Carregando…</ThemedText>
				</ThemedView>
			)}

			{selectedState !== null && error && (
				<ThemedView className="flex-1 items-center justify-center">
					<ThemedText type="default">Erro ao carregar: {error.message}</ThemedText>
				</ThemedView>
			)}

			{selectedState !== null && !loading && !error && (
				<FlatList
					data={parities}
					keyExtractor={(item, index) => `${item.stationName}-${index}`}
					contentContainerClassName="px-four"
					ListEmptyComponent={
						<ThemedText type="default" themeColor="textSecondary" className="mt-four text-center">
							Nenhum posto com etanol e gasolina coletados nesse estado.
						</ThemedText>
					}
					renderItem={({ item }) => (
						<Pressable
							className="flex-row items-start justify-between gap-two border-b-medium py-three"
							style={{ borderBottomColor: theme.text }}
							onPress={() => setSelectedStation(item)}
						>
							<View className="flex-1 gap-half">
								<MarqueeText type="smallBold" style={textOverrides.stationName}>
									{toTitleCase(item.stationName)}
								</MarqueeText>
								<View
									className="min-w-[76px] items-center self-start border-thin px-two py-half"
									style={{ backgroundColor: CategoryColors.coral, borderColor: theme.text }}
								>
									<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
										{item.brand}
									</ThemedText>
								</View>
								<ThemedText type="small" themeColor="textSecondary" style={textOverrides.address}>
									{toTitleCase(item.municipality)}/{item.state}
								</ThemedText>
							</View>

							<View className="items-end gap-half">
								<View
									className="items-center self-end border-thin px-two py-half"
									style={{
										backgroundColor: item.isEthanolAdvantageous ? CategoryColors.green : CategoryColors.coral,
										borderColor: theme.text,
									}}
								>
									<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
										{item.isEthanolAdvantageous ? "Etanol vale mais" : "Gasolina vale mais"}
									</ThemedText>
								</View>
								<ThemedText type="small" style={textOverrides.price}>
									E R$ {item.ethanolPrice.toFixed(2)} · G R$ {item.gasolinePrice.toFixed(2)}
								</ThemedText>
								<ThemedText type="small" themeColor="textSecondary" style={textOverrides.priceUnit}>
									razão {item.ratio.toFixed(2)}
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
				contentStyle={textOverrides.stationModalContent}
			>
				{selectedStation && (
					<>
						<ThemedText type="subtitle">{toTitleCase(selectedStation.stationName)}</ThemedText>

						<View
							className="my-half min-w-[76px] items-center self-start border-thin px-two py-half"
							style={{ backgroundColor: CategoryColors.coral, borderColor: theme.text }}
						>
							<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
								{selectedStation.brand}
							</ThemedText>
						</View>

						<ThemedText type="small" themeColor="textSecondary">
							{toTitleCase(selectedStation.municipality)}/{selectedStation.state}
						</ThemedText>

						<View
							className="mt-two items-center self-start border-thin px-two py-half"
							style={{
								backgroundColor: selectedStation.isEthanolAdvantageous ? CategoryColors.green : CategoryColors.coral,
								borderColor: theme.text,
							}}
						>
							<ThemedText className="text-center" style={textOverrides.brandTagText} numberOfLines={1}>
								{selectedStation.isEthanolAdvantageous ? "Etanol vale mais" : "Gasolina vale mais"}
							</ThemedText>
						</View>

						<ThemedText type="default" className="mt-two">
							Etanol R$ {selectedStation.ethanolPrice.toFixed(2)} · Gasolina R$ {selectedStation.gasolinePrice.toFixed(2)}
						</ThemedText>
						<ThemedText type="small" themeColor="textSecondary">
							razão {selectedStation.ratio.toFixed(2)}
						</ThemedText>

						<View className="mt-three flex-row">
							<HardShadowBox
								offset={3}
								className="px-three py-one"
								onPress={() =>
									openInMaps({
										name: selectedStation.stationName,
										municipality: selectedStation.municipality,
										state: selectedStation.state,
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
				visible={stateModalVisible}
				onClose={() => setStateModalVisible(false)}
				title="Escolher estado"
				titleBarColor={CategoryColors.blue}
				contentStyle={textOverrides.stateModalContent}
			>
				<View className="flex-row flex-wrap justify-center gap-two">
					{BRAZILIAN_STATES.map((item) => {
						const active = item.code === selectedState;
						return (
							<HardShadowBox
								key={item.code}
								offset={2}
								onPress={() => {
									setManualState(item.code);
									setStateModalVisible(false);
								}}
								className="w-[44px] items-center px-one py-one"
								style={active ? { backgroundColor: AccentColor } : undefined}
							>
								<ThemedText type="smallBold" style={textOverrides.stateChipText} numberOfLines={1}>
									{item.code}
								</ThemedText>
							</HardShadowBox>
						);
					})}
				</View>
			</VintageWindowModal>
		</ThemedView>
	);
}
