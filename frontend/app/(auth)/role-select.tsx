import { Redirect } from 'expo-router';

/** Role is chosen on the register screen; kept so old links still work. */
export default function RoleSelectScreen() {
  return <Redirect href="/(auth)/register" />;
}
