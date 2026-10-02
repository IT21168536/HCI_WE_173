import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { colors } from '@/shared/theme/colors';
import { screenStyles } from '@/shared/theme/screen';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { login } from '@/core/auth/auth.service';

export default function LoginScreen() {
  const [email, setEmail] = useState('customer1@test.com');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      const user = await login(email, password);
      router.replace(`/${user.role === 'customer' ? '(customer)/(tabs)/home' : user.role === 'cook' ? '(cook)/(tabs)/dashboard' : '(rider)/(tabs)/dashboard'}` as any);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Worky Kitchen" subtitle="Local home-cooked meals from cooks you can trust." />
      <View style={styles.card}>
        <AppInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton title="Login" loading={loading} onPress={handleLogin} />
        <Link href={'/(auth)/register' as any} style={styles.link}>
          Create an account
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  link: {
    ...typography.body,
    color: colors.brandDark,
    textAlign: 'center',
  },
});
