import { View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { HamburgerMenu } from '@/components/hamburger-menu';

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AppTabs />
      <HamburgerMenu />
    </View>
  );
}
