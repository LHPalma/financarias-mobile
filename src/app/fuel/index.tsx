import { View } from "react-native";
import { Link } from "expo-router";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CategoryColors } from "@/constants/theme";

const TOOLS = [
	{
		href: "/fuel/cheapest",
		icon: "◆",
		iconColor: "#FFFFFF",
		title: "Postos mais baratos",
		subtitle: "Ranking de postos por preço na sua região",
		color: CategoryColors.coral,
	},
	{
		href: "/fuel/parity",
		icon: "E/G",
		iconColor: "#000000",
		title: "Etanol ou gasolina?",
		subtitle: "Descubra qual compensa em cada posto",
		color: CategoryColors.mustard,
	},
	{
		href: "/fuel/brand-ranking",
		icon: "#",
		iconColor: "#000000",
		title: "Comparar por bandeira",
		subtitle: "Preço médio por rede num estado",
		color: CategoryColors.mustard,
	},
	{
		href: "/fuel/region-ranking",
		icon: "▲",
		iconColor: "#FFFFFF",
		title: "Ranking por região",
		subtitle: "Compare estados ou municípios",
		color: CategoryColors.blue,
	},
] as const;

export default function FuelHubScreen() {
	return (
		<ThemedView className="flex-1 gap-three p-four">
			<ThemedText type="title" className="mb-two">
				Combustíveis
			</ThemedText>

			{TOOLS.map((tool) => (
				<Link key={tool.href} href={tool.href} asChild>
					<HardShadowBox offset={4} className="flex-row items-center gap-three p-three">
						<View className="h-[44px] w-[44px] items-center justify-center" style={{ backgroundColor: tool.color }}>
							<ThemedText type="subtitle" style={{ color: tool.iconColor }}>
								{tool.icon}
							</ThemedText>
						</View>

						<View className="flex-1 gap-half">
							<ThemedText type="subtitle">{tool.title}</ThemedText>
							<ThemedText type="small" themeColor="textSecondary">
								{tool.subtitle}
							</ThemedText>
						</View>

						<ThemedText type="subtitle" themeColor="textSecondary">
							›
						</ThemedText>
					</HardShadowBox>
				</Link>
			))}
		</ThemedView>
	);
}
