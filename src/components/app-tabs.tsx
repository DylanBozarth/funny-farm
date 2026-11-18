import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.text }}
      tintColor={colors.text}
      shadowColor={colors.backgroundSelected}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Memes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/emoji-memes.png')} renderingMode="original" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="judge">
        <NativeTabs.Trigger.Label>Judge</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/emoji-judge.png')} renderingMode="original" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="upload">
        <NativeTabs.Trigger.Label>Upload</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/emoji-upload.png')} renderingMode="original" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/emoji-account.png')} renderingMode="original" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
