import { NativeTabs } from "expo-router/unstable-native-tabs";

import { COLORS } from "@/theme/tokens";
import { useThemeContext } from "@/context/ThemeContext";

export default function AppTabs() {
  const { theme: t } = useThemeContext();

  return (
    <NativeTabs
      backgroundColor={t.card}
      tintColor={COLORS.rust}
      labelStyle={{
        color: t.title,
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "home", selected: "home_filled" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "search", selected: "search" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label>+</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="add" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my-games">
        <NativeTabs.Trigger.Label>My Games</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "event", selected: "event" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "person", selected: "person" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
