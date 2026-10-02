import { Redirect } from 'expo-router';

export default function SearchScreen() {
  return <Redirect href={'/(customer)/(tabs)/home' as any} />;
}
