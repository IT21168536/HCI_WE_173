import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { colors } from '@/shared/theme/colors';
import { screenStyles } from '@/shared/theme/screen';
import { spacing } from '@/shared/theme/spacing';
import { register } from '@/core/auth/auth.service';
import type { UserRole } from '@/shared/types/User';

export default function RegisterScreen() {
  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    try {
      const user = await register({ fullName, email, password, role });
      router.replace(`/${user.role === 'customer' ? '(customer)/(tabs)/home' : user.role === 'cook' ? '(cook)/(tabs)/dashboard' : '(rider)/(tabs)/dashboard'}` as any);
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Join Worky Kitchen" subtitle="Register as a customer, cook, or rider." />
      <View style={styles.roles}>
        {(['customer', 'cook', 'rider'] as UserRole[]).map((item) => (
          <AppButton key={item} title={item} variant={role === item ? 'primary' : 'secondary'} onPress={() => setRole(item)} />
        ))}
      </View>
      <AppInput label="Full name" value={fullName} onChangeText={setFullName} />
      <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <AppButton title="Create account" onPress={handleRegister} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  roles: {
    gap: spacing.sm,
  },
});
