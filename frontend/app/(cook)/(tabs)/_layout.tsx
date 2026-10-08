import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/shared/navigation/tabOptions';

export default function CookTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="meals" options={{ title: 'Meals', tabBarIcon: tabIcon('grid-outline', 'grid') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: tabIcon('clipboard-outline', 'clipboard') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
