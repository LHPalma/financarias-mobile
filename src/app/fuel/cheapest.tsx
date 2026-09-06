import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { MarqueeText } from "@/components/marquee-text";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AccentColor, BorderWidth, CategoryColors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const CHEAPEST_FUEL_PRICES = gql`
	query CheapestFuelPrices($product: FuelProduct!) {
		cheapestFuelPrices(product: $product, first: 20) {
			edges {
				node {
					id
					salePrice
					collectedOn
					fuelStation {
						name
						brand
						municipality
						state
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

function toTitleCase(text: string): string {
	return text
		.toLowerCase()
		.split(" ")
		.map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
		.join(" ");
}

export default function CheapestFuelPricesScreen() {
	const theme = useTheme();
	const [product, setProduct] = useState<FuelProductValue>("GASOLINE");
	const { data, loading, error } = useQuery<CheapestFuelPricesData>(CHEAPEST_FUEL_PRICES, {
		variables: { product },
	});

	const prices = data?.cheapestFuelPrices.edges.map((edge: { node: FuelPriceNode }) => edge.node) ?? [];

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
					<View
						style={[
							styles.chip,
							styles.staticChip,
							{ backgroundColor: theme.backgroundElement, borderColor: theme.text },
						]}
					>
						<ThemedText type="small" themeColor="textSecondary">
							São Paulo, SP
						</ThemedText>
					</View>
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
						<View style={[styles.row, { borderBottomColor: theme.text }]}>
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
						</View>
					)}
				/>
			)}
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
	staticChip: {
		borderWidth: BorderWidth.medium,
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
});
