import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { resetPassword } from '@/core/auth/auth.service';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { Screen } from '@/shared/components/Screen';
import { IconCircle, Notice } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { errorMessage } from '@/shared/utils/alerts';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    try {
      setLoading(true);
      setError(null);
      await resetPassword(email, mobile, password);
      Alert.alert('Password updated', 'You can now log in with your new password.');
      router.replace('/(auth)/login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      title="Forgot Password"
      back
      onBack={() => router.replace('/(auth)/login')}
      background={colors.surface}
      footer={
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title="Reset password" loading={loading} onPress={handleReset} />
        </>
      }
    >
      <View style={styles.intro}>
        <IconCircle icon="lock-closed-outline" size={72} />
        <Text accessibilityRole="header" style={styles.title}>
          Reset your password
        </Text>
        <Text style={styles.subtitle}>Confirm the email and phone number on your account, then choose a new password.</Text>
      </View>
      <AppInput label="Email address" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
      <AppInput label="Phone number" icon="call-outline" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="077 123 4567" />
      <AppInput label="New password" icon="lock-closed-outline" password value={password} onChangeText={setPassword} placeholder="At least 6 characters" />
      <Notice text="This prototype stores accounts on this phone only, so the reset happens here instead of by email or SMS." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.screenTitle,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
