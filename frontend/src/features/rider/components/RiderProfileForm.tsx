import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser, useSession } from '@/core/auth/SessionContext';
import { pickAndStoreImage } from '@/core/storage/image.service';
import {
  getRiderProfile,
  saveRiderAccount,
  validateRiderAccount,
  type RiderFieldErrors,
} from '@/features/rider/services/rider.service';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { Avatar } from '@/shared/components/Avatar';
import { Icon } from '@/shared/components/Icon';
import { LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Card, Chip, ChipRow } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { VEHICLE_LABELS, type VehicleType } from '@/shared/types/RiderProfile';
import { errorMessage, showError } from '@/shared/utils/alerts';

const VEHICLE_TYPES = Object.keys(VEHICLE_LABELS) as VehicleType[];

export function RiderProfileForm() {
  const user = useCurrentUser();
  const { setUser } = useSession();
  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState((user.mobile ?? '').replace(/\D/g, '').slice(0, 10));
  const [address, setAddress] = useState(user.address ?? '');
  const [photo, setPhoto] = useState<string | null>(user.profileImage ?? null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RiderFieldErrors>({});

  useEffect(() => {
    let active = true;
    getRiderProfile(user.id)
      .then((profile) => {
        if (!active || !profile) return;
        setVehicleType(profile.vehicleType);
        setVehicleNumber(profile.vehicleNumber ?? '');
        setLicenseNumber(profile.licenseNumber ?? '');
        setEmergencyContact((profile.emergencyContact ?? '').replace(/\D/g, '').slice(0, 10));
      })
      .catch((err) => active && setFormError(errorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.id]);

  async function pickPhoto() {
    try {
      const stored = await pickAndStoreImage('profiles');
      if (stored) setPhoto(stored);
    } catch (err) {
      showError('Could not add photo', err);
    }
  }

  async function save() {
    const input = { fullName, mobile, address, profileImage: photo, vehicleType, vehicleNumber, licenseNumber, emergencyContact };
    const errors = validateRiderAccount(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Correct the highlighted fields before saving.');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const updatedUser = await saveRiderAccount(user.id, input);
      setUser(updatedUser);
      Alert.alert('Profile saved', 'Your rider and vehicle details are up to date.');
      router.back();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title="Rider Profile"
      subtitle="Personal and vehicle details"
      back
      background={colors.surface}
      actions={[{ icon: 'checkmark', label: 'Save profile', onPress: save }]}
      footer={
        <>
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <AppButton title="Save rider profile" icon="checkmark" loading={saving} onPress={save} />
        </>
      }
    >
      {loading ? <LoadingView message="Loading rider details..." /> : null}

      <View style={styles.photo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={pickPhoto}>
          <Avatar name={fullName || user.fullName} uri={photo} size={88} />
          <View style={styles.cameraBadge}>
            <Icon name="camera-outline" size={15} color={colors.surface} />
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={pickPhoto} hitSlop={8}>
          <Text style={styles.link}>Change photo</Text>
        </Pressable>
      </View>

      <View style={styles.sectionTitleRow}>
        <Icon name="person-outline" size={19} color={colors.brandText} />
        <Text style={styles.sectionTitle}>Personal details</Text>
      </View>
      <Card style={styles.formSection}>
        <AppInput
          label="Full name"
          icon="person-outline"
          value={fullName}
          error={fieldErrors.fullName}
          onChangeText={(value) => {
            setFullName(value);
            setFieldErrors((current) => ({ ...current, fullName: undefined }));
          }}
          maxLength={60}
        />
        <AppInput
          label="Mobile number"
          icon="call-outline"
          value={mobile}
          error={fieldErrors.mobile}
          onChangeText={(value) => {
            setMobile(value.replace(/\D/g, '').slice(0, 10));
            setFieldErrors((current) => ({ ...current, mobile: undefined }));
          }}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="0771234567"
          hint="Enter exactly 10 digits."
        />
        <AppInput label="Email address" icon="mail-outline" value={user.email} editable={false} hint="Your login email cannot be changed here." />
        <AppInput
          label="Home address"
          icon="location-outline"
          value={address}
          error={fieldErrors.address}
          onChangeText={(value) => {
            setAddress(value);
            setFieldErrors((current) => ({ ...current, address: undefined }));
          }}
          placeholder="House no., street, town"
          maxLength={120}
        />
        <AppInput
          label="Emergency contact"
          icon="medical-outline"
          value={emergencyContact}
          error={fieldErrors.emergencyContact}
          onChangeText={(value) => {
            setEmergencyContact(value.replace(/\D/g, '').slice(0, 10));
            setFieldErrors((current) => ({ ...current, emergencyContact: undefined }));
          }}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="0771234567"
          hint="Must be 10 digits and different from your mobile number."
        />
      </Card>

      <View style={styles.sectionTitleRow}>
        <Icon name="bicycle-outline" size={20} color={colors.brandText} />
        <Text style={styles.sectionTitle}>Vehicle details</Text>
      </View>
      <Card style={styles.formSection} tone="brand">
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicle type</Text>
          <ChipRow>
            {VEHICLE_TYPES.map((type) => (
              <Chip
                key={type}
                label={VEHICLE_LABELS[type]}
                selected={vehicleType === type}
                onPress={() => {
                  setVehicleType(type);
                  setFieldErrors((current) => ({ ...current, vehicleNumber: undefined, licenseNumber: undefined }));
                }}
              />
            ))}
          </ChipRow>
        </View>
        {vehicleType !== 'bicycle' ? (
          <>
            <AppInput
              label="Vehicle registration number"
              icon="car-sport-outline"
              value={vehicleNumber}
              error={fieldErrors.vehicleNumber}
              onChangeText={(value) => {
                setVehicleNumber(value.toUpperCase());
                setFieldErrors((current) => ({ ...current, vehicleNumber: undefined }));
              }}
              autoCapitalize="characters"
              placeholder="WP BCD-4582"
              maxLength={11}
              hint="Examples: WP BCD-4582 or CAB-1234."
            />
            <AppInput
              label="Driving licence number"
              icon="card-outline"
              value={licenseNumber}
              error={fieldErrors.licenseNumber}
              onChangeText={(value) => {
                setLicenseNumber(value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8));
                setFieldErrors((current) => ({ ...current, licenseNumber: undefined }));
              }}
              autoCapitalize="characters"
              placeholder="B1234567"
              maxLength={8}
              hint="One letter followed by seven digits."
            />
          </>
        ) : (
          <Text style={styles.hint}>A registration and driving licence are not required for bicycle deliveries.</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', gap: spacing.sm },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: colors.brandStrong,
    borderColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    bottom: -2,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    width: 32,
  },
  link: { ...typography.bodyStrong, color: colors.brandText },
  sectionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  formSection: { gap: spacing.lg, padding: spacing.lg },
  fieldGroup: { gap: spacing.sm },
  label: { ...typography.label, color: colors.ink },
  hint: { ...typography.caption, color: colors.muted, lineHeight: 18 },
  error: { ...typography.body, color: colors.danger },
});
