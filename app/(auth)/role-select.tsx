import { Redirect } from 'expo-router';

export default function RoleSelectScreen() {
  return <Redirect href={'/(auth)/register' as any} />;
}
