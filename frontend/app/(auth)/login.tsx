import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { homeRouteFor, login } from '@/core/auth/auth.service';
import { useSession } from '@/core/auth/SessionContext';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { Chip, ChipRow } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { errorMessage } from '@/shared/utils/alerts';

const demoAccounts = [
  { label: 'Customer', email: 'customer1@test.com' },
  { label: 'Home cook', email: 'cook1@test.com' },
  { label: 'Rider', email: 'rider1@test.com' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setUser } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);
      setUser(user);
      router.replace(homeRouteFor(user.role));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account: (typeof demoAccounts)[number]) {
    setEmail(account.email);
    setPassword('demo-password');
    setError(null);
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Image source={require('../../assets/images/woky_logo.png')} style={styles.logo} accessibilityLabel="Woky Kitchen logo" />
          <Text accessibilityRole="header" style={styles.title}>
            Welcome back
          </Text>
          <Text style={styles.subtitle}>Home-cooked meals from cooks you can trust.</Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Email address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <AppInput
            label="Password"
            icon="lock-closed-outline"
            password
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={handleLogin}
          />
          <View style={styles.forgotRow}>
            <Link href="/(auth)/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </View>
          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <AppButton title="Log in" loading={loading} onPress={handleLogin} />
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Try a demo account</Text>
          <ChipRow>
            {demoAccounts.map((account) => (
              <Chip key={account.email} label={account.label} selected={email === account.email} onPress={() => fillDemo(account)} />
            ))}
          </ChipRow>
          <Text style={styles.demoHint}>Demo password: demo-password</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Worky Kitchen?</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={[styles.link, styles.bold]}>Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    height: 128,
    width: 128,
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
  form: {
    gap: spacing.lg,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
  },
  link: {
    ...typography.captionStrong,
    color: colors.brandText,
  },
  bold: {
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
  demo: {
    backgroundColor: colors.soft,
    borderRadius: 14,
    gap: spacing.sm,
    padding: spacing.md,
  },
  demoTitle: {
    ...typography.label,
    color: colors.ink,
  },
  demoHint: {
    ...typography.caption,
    color: colors.muted,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.muted,
  },
});
