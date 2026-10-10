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
import { isEmail, isPassword, isTenDigitPhone } from '@/shared/utils/validators';

type Errors = Partial<Record<'email' | 'mobile' | 'password', string>>;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function handleReset() {
    const nextErrors: Errors = {};
    if (!isEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!isTenDigitPhone(mobile)) nextErrors.mobile = 'Enter exactly 10 digits, for example 0771234567.';
    if (!isPassword(password)) nextErrors.password = 'Use 6–64 characters with at least one letter and one number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the highlighted fields.');
      return;
    }
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
      <AppInput label="Email address" icon="mail-outline" value={email} onChangeText={(value) => { setEmail(value); setErrors((current) => ({ ...current, email: undefined })); }} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" maxLength={254} error={errors.email} />
      <AppInput label="Phone number" icon="call-outline" value={mobile} onChangeText={(value) => { setMobile(value.replace(/\D/g, '').slice(0, 10)); setErrors((current) => ({ ...current, mobile: undefined })); }} keyboardType="phone-pad" placeholder="0771234567" maxLength={10} error={errors.mobile} />
      <AppInput label="New password" icon="lock-closed-outline" password value={password} onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }} placeholder="At least 6 characters" maxLength={64} error={errors.password} />
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
