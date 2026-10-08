import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/shared/navigation/tabOptions';

export default function RiderTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="current" options={{ title: 'Current', tabBarIcon: tabIcon('bicycle-outline', 'bicycle') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('time-outline', 'time') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
