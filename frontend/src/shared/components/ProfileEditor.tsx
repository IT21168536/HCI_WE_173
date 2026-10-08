import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSession, useCurrentUser } from '@/core/auth/SessionContext';
import { getCookProfile, upsertCookProfile } from '@/core/repositories/cook.repository';
import { updateUser } from '@/core/repositories/user.repository';
import { pickAndStoreImage } from '@/core/storage/image.service';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { errorMessage, showError } from '@/shared/utils/alerts';
import { isPhone } from '@/shared/utils/validators';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { LoadingView } from './LoadingView';
import { Screen } from './Screen';

type ProfileEditorProps = {
  /** Customers and cooks keep an address; cooks also edit their kitchen details. */
  showAddress?: boolean;
  kitchen?: boolean;
  variant?: 'brand' | 'dark';
};

/** Shared "Edit Profile" screen body used by all three roles. */
export function ProfileEditor({ showAddress = false, kitchen = false, variant = 'dark' }: ProfileEditorProps) {
  const user = useCurrentUser();
  const { setUser } = useSession();
  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState(user.mobile ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [photo, setPhoto] = useState<string | null>(user.profileImage ?? null);
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [hygieneInfo, setHygieneInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [loading, setLoading] = useState(kitchen);

  useEffect(() => {
    if (!kitchen) return;
    let active = true;
    getCookProfile(user.id)
      .then((profile) => {
        if (!active) return;
        setBusinessName(profile?.businessName ?? '');
        setLocation(profile?.location ?? '');
        setDescription(profile?.description ?? '');
        setHygieneInfo(profile?.hygieneInfo ?? '');
      })
      .catch((err) => active && setFormError(errorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [kitchen, user.id]);

  async function onPickPhoto() {
    try {
      const stored = await pickAndStoreImage('profiles');
      if (stored) setPhoto(stored);
    } catch (err) {
      showError('Could not add photo', err);
    }
  }

  async function onSave() {
    if (!fullName.trim()) {
      setFormError('Enter your full name.');
      return;
    }
    if (mobile && !isPhone(mobile)) {
      setFormError('Enter a valid phone number, for example 077 123 4567.');
      return;
    }
    if (kitchen && !businessName.trim()) {
      setFormError('Enter your kitchen name.');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const updated = await updateUser(user.id, { fullName, mobile, address: showAddress ? address : user.address, profileImage: photo });
      if (kitchen) {
        await upsertCookProfile(user.id, { businessName, location, description, hygieneInfo });
      }
      setUser(updated);
      Alert.alert('Profile saved', 'Your changes are up to date.');
      router.back();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Edit Profile"
      back
      variant={variant}
      background={colors.surface}
      actions={[{ icon: 'checkmark', label: 'Save changes', onPress: onSave }]}
      footer={
        <>
          {formError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {formError}
            </Text>
          ) : null}
          <AppButton title="Save changes" loading={saving} onPress={onSave} />
        </>
      }
    >
      {loading ? <LoadingView message="Loading kitchen details..." /> : null}
      <View style={styles.photo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Change photo" onPress={onPickPhoto}>
          <Avatar name={fullName || user.fullName} uri={photo} size={84} />
          <View style={styles.cameraBadge}>
            <Icon name="camera-outline" size={14} color={colors.surface} />
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onPickPhoto} hitSlop={8}>
          <Text style={styles.link}>Change photo</Text>
        </Pressable>
      </View>

      <AppInput label="Full name" icon="person-outline" value={fullName} onChangeText={setFullName} />
      {kitchen ? <AppInput label="Kitchen name" icon="storefront-outline" value={businessName} onChangeText={setBusinessName} /> : null}
      <AppInput label="Phone number" icon="call-outline" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      <AppInput label="Email address" icon="mail-outline" value={user.email} editable={false} hint="Your email is your login and can't be changed here." />
      {showAddress ? (
        <AppInput label={kitchen ? 'Kitchen address' : 'Delivery address'} icon="location-outline" value={address} onChangeText={setAddress} placeholder="House no., street, town" />
      ) : null}
      {kitchen ? (
        <>
          <AppInput label="Area shown to customers" icon="map-outline" value={location} onChangeText={setLocation} placeholder="e.g. Malabe" />
          <AppInput label="About your kitchen" value={description} onChangeText={setDescription} multiline placeholder="What do you cook? What makes it special?" />
          <AppInput label="Hygiene & food safety" value={hygieneInfo} onChangeText={setHygieneInfo} multiline placeholder="e.g. Fresh produce daily, sealed packaging" />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: colors.brandStrong,
    borderColor: colors.surface,
    borderRadius: 15,
    borderWidth: 2,
    bottom: -2,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 30,
  },
  link: {
    ...typography.bodyStrong,
    color: colors.brandText,
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
