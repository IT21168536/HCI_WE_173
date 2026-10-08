import { Tabs } from 'expo-router';
import { tabIcon, tabScreenOptions } from '@/shared/navigation/tabOptions';

export default function CustomerTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: tabIcon('receipt-outline', 'receipt') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorite', tabBarIcon: tabIcon('heart-outline', 'heart') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline', 'person') }} />
    </Tabs>
  );
}
