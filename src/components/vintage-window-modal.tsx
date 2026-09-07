import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleProp, View, ViewStyle } from "react-native";

import { HardShadowBox } from "@/components/hard-shadow-box";
import { ThemedText } from "@/components/themed-text";
import { CategoryColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type VintageWindowModalProps = PropsWithChildren<{
	visible: boolean;
	onClose: () => void;
	title: string;
	titleBarColor?: string;
	contentStyle?: StyleProp<ViewStyle>;
}>;

export function VintageWindowModal({
	visible,
	onClose,
	title,
	titleBarColor = CategoryColors.mustard,
	contentStyle,
	children,
}: VintageWindowModalProps) {
	const theme = useTheme();

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable
				className="flex-1 items-center justify-center p-five"
				style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
				onPress={onClose}
			>
				{/* A largura da janela fica aqui, num pai de largura definida, e não no HardShadowBox:
				    o wrapper da sombra se dimensiona pelo conteúdo, então um Card com largura em %
				    dependeria de um pai que depende dele. */}
				<Pressable className="w-full max-w-[340px]" onPress={(event) => event.stopPropagation()}>
					<HardShadowBox offset={5} className="overflow-hidden p-0">
						<View
							className="flex-row items-center gap-two border-b-thick p-two"
							style={{ backgroundColor: titleBarColor, borderBottomColor: theme.text }}
						>
							<ThemedText type="smallBold" className="flex-1" style={{ color: theme.text }} numberOfLines={1}>
								{title}
							</ThemedText>
							<Pressable
								className="h-[18px] w-[18px] items-center justify-center border-thin"
								style={{ backgroundColor: CategoryColors.coral, borderColor: theme.text }}
								onPress={onClose}
							>
								<ThemedText style={{ fontSize: 11, lineHeight: 12, color: theme.background }}>✕</ThemedText>
							</Pressable>
						</View>

						<View className="min-h-[210px] gap-two p-four" style={contentStyle}>
							{children}
						</View>
					</HardShadowBox>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
