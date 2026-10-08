import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { homeRouteFor, register } from '@/core/auth/auth.service';
import { useSession } from '@/core/auth/SessionContext';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { Icon } from '@/shared/components/Icon';
import { Screen } from '@/shared/components/Screen';
import { Notice, Segmented } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { UserRole } from '@/shared/types/User';
import { errorMessage } from '@/shared/utils/alerts';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'cook', label: 'Home cook' },
  { value: 'rider', label: 'Rider' },
];

const roleIntro: Record<UserRole, string> = {
  customer: 'Order home-cooked meals from cooks near you.',
  cook: 'Tell us about you and your kitchen to start selling home-cooked meals.',
  rider: 'Deliver meals from home kitchens to customers nearby.',
};

export default function RegisterScreen() {
  const { setUser } = useSession();
  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [kitchenName, setKitchenName] = useState('');
  const [kitchenLocation, setKitchenLocation] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!agreed) {
      setError(role === 'cook' ? 'Please agree to the Terms and Food Safety Policy.' : 'Please agree to the Terms of Use.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = await register({
        fullName,
        email,
        mobile,
        address: role === 'customer' || role === 'cook' ? address : undefined,
        password,
        role,
        kitchen: role === 'cook' ? { businessName: kitchenName, location: kitchenLocation } : undefined,
      });
      setUser(user);
      router.replace(homeRouteFor(user.role));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      title="Create Account"
      back
      onBack={() => router.replace('/(auth)/login')}
      variant={role === 'cook' ? 'brand' : 'dark'}
      background={colors.surface}
      footer={
        <>
          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <AppButton title="Create account" loading={loading} onPress={handleRegister} />
        </>
      }
    >
      <Text style={styles.label}>I want to join as</Text>
      <Segmented options={roleOptions} value={role} onChange={setRole} />
      <Text style={styles.intro}>{roleIntro[role]}</Text>

      <AppInput label="Full name" icon="person-outline" value={fullName} onChangeText={setFullName} placeholder="e.g. Nadeesha Perera" autoComplete="name" />
      {role === 'cook' ? (
        <>
          <AppInput label="Kitchen name" icon="storefront-outline" value={kitchenName} onChangeText={setKitchenName} placeholder="e.g. Nadeesha Kitchen" />
          <AppInput label="Kitchen area" icon="location-outline" value={kitchenLocation} onChangeText={setKitchenLocation} placeholder="e.g. Malabe" />
        </>
      ) : null}
      <AppInput
        label="Phone number"
        icon="call-outline"
        value={mobile}
        onChangeText={setMobile}
        placeholder="077 123 4567"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <AppInput
        label="Email address"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      {role !== 'rider' ? (
        <AppInput
          label={role === 'cook' ? 'Kitchen address' : 'Delivery address'}
          icon="home-outline"
          value={address}
          onChangeText={setAddress}
          placeholder="House no., street, town"
          autoComplete="street-address"
        />
      ) : null}
      <AppInput label="Password" icon="lock-closed-outline" password value={password} onChangeText={setPassword} placeholder="At least 6 characters" hint="Use at least 6 characters." />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => setAgreed((value) => !value)}
        style={styles.agree}
      >
        <View style={[styles.checkbox, agreed && styles.checkboxOn]}>{agreed ? <Icon name="checkmark" size={14} color={colors.surface} /> : null}</View>
        <Text style={styles.agreeText}>
          I agree to the Terms of Use{role === 'cook' ? ' and Food Safety Policy' : ''}
        </Text>
      </Pressable>

      {role === 'cook' ? (
        <Notice icon="shield-checkmark-outline" text="New kitchens are reviewed by our team. You can set up your meals while we verify your details." />
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.ink,
  },
  intro: {
    ...typography.body,
    color: colors.muted,
  },
  agree: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#BDBDBD',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxOn: {
    backgroundColor: colors.brandStrong,
    borderColor: colors.brandStrong,
  },
  agreeText: {
    ...typography.caption,
    color: colors.ink,
    flex: 1,
  },
  error: {
    ...typography.body,
    color: colors.danger,
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
  link: {
    ...typography.bodyStrong,
    color: colors.brandText,
  },
});
