import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        className="rounded-[16px] px-three py-one">
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} className="absolute w-full flex-row items-center justify-center p-three">
      <ThemedView
        type="backgroundElement"
        className="grow flex-row items-center gap-two rounded-[32px] px-five py-two"
        style={{ maxWidth: MaxContentWidth }}>
        <ThemedText type="smallBold" className="mr-auto">
          Finançarias
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}
