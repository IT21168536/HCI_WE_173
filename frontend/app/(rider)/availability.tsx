import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useCurrentUser } from '@/core/auth/SessionContext';
import {
  createRiderSchedule,
  deleteRiderSchedule,
  listRiderSchedules,
  updateRiderSchedule,
} from '@/features/rider/services/rider.service';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { Badge, Card, Chip, ChipRow, IconCircle, Notice, ToggleRow } from '@/shared/components/ui';
import { useFocusData } from '@/shared/hooks/useFocusData';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import type { RiderSchedule } from '@/shared/types/RiderSchedule';
import { DAY_NAMES } from '@/shared/types/RiderSchedule';
import { confirm, errorMessage, showError } from '@/shared/utils/alerts';

type FormState = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const NEW_SHIFT: FormState = { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true };
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function displayTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export default function RiderAvailabilityScreen() {
  const user = useCurrentUser();
  const { data: schedules, loading, error, reload } = useFocusData(
    () => listRiderSchedules(user.id),
    [] as RiderSchedule[],
    [user.id],
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(NEW_SHIFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [timeErrors, setTimeErrors] = useState<{ startTime?: string; endTime?: string }>({});

  function openCreate() {
    setEditingId(null);
    setForm(NEW_SHIFT);
    setFormError(null);
    setTimeErrors({});
    setShowForm(true);
  }

  function openEdit(schedule: RiderSchedule) {
    setEditingId(schedule.id);
    setForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable,
    });
    setFormError(null);
    setTimeErrors({});
    setShowForm(true);
  }

  async function save() {
    const nextErrors: { startTime?: string; endTime?: string } = {};
    if (!TIME_PATTERN.test(form.startTime)) nextErrors.startTime = 'Use HH:MM, for example 08:30.';
    if (!TIME_PATTERN.test(form.endTime)) nextErrors.endTime = 'Use HH:MM, for example 17:00.';
    if (!nextErrors.startTime && !nextErrors.endTime && form.startTime >= form.endTime) {
      nextErrors.endTime = 'End time must be later than start time.';
    }
    setTimeErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Correct the highlighted time fields.');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      if (editingId) {
        await updateRiderSchedule(editingId, user.id, form);
      } else {
        await createRiderSchedule(user.id, form);
      }
      await reload();
      setShowForm(false);
      Alert.alert(editingId ? 'Shift updated' : 'Shift added', 'Your working schedule is up to date.');
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(schedule: RiderSchedule) {
    const accepted = await confirm(
      'Delete this shift?',
      `${DAY_NAMES[schedule.dayOfWeek]}, ${displayTime(schedule.startTime)} to ${displayTime(schedule.endTime)}`,
      'Delete shift',
      true,
    );
    if (!accepted) return;
    try {
      await deleteRiderSchedule(schedule.id, user.id);
      await reload();
    } catch (err) {
      showError('Could not delete shift', err);
    }
  }

  async function toggle(schedule: RiderSchedule) {
    try {
      await updateRiderSchedule(schedule.id, user.id, { ...schedule, isAvailable: !schedule.isAvailable });
      await reload();
    } catch (err) {
      showError('Could not update shift', err);
    }
  }

  const enabledCount = schedules.filter((schedule) => schedule.isAvailable).length;

  return (
    <Screen
      title="Working Schedule"
      subtitle="Manage when you can deliver"
      back
      actions={[{ icon: 'add', label: 'Add shift', onPress: openCreate }]}
    >
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <IconCircle icon="calendar-outline" size={48} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.summaryValue}>{enabledCount}</Text>
          <Text style={styles.summaryLabel}>{enabledCount === 1 ? 'active weekly shift' : 'active weekly shifts'}</Text>
        </View>
        <Badge label={enabledCount > 0 ? 'Schedule set' : 'Not scheduled'} tone={enabledCount > 0 ? 'success' : 'warning'} />
      </View>

      <Notice text="Add one or more shifts for each day. Paused shifts stay saved and can be enabled again anytime." />

      {showForm ? (
        <Card tone="brand" style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formTitle}>{editingId ? 'Edit shift' : 'Add a new shift'}</Text>
              <Text style={styles.muted}>Times use the 24-hour format</Text>
            </View>
            <AppButton title="Cancel" size="sm" variant="ghost" onPress={() => setShowForm(false)} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Working day</Text>
            <ChipRow>
              {DAY_NAMES.map((day, index) => (
                <Chip key={day} label={day.slice(0, 3)} selected={form.dayOfWeek === index} onPress={() => setForm((current) => ({ ...current, dayOfWeek: index }))} />
              ))}
            </ChipRow>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.flex}>
              <AppInput
                label="Start time"
                icon="time-outline"
                value={form.startTime}
                error={timeErrors.startTime}
                onChangeText={(startTime) => {
                  setForm((current) => ({ ...current, startTime }));
                  setTimeErrors((current) => ({ ...current, startTime: undefined }));
                }}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <View style={styles.flex}>
              <AppInput
                label="End time"
                icon="time-outline"
                value={form.endTime}
                error={timeErrors.endTime}
                onChangeText={(endTime) => {
                  setForm((current) => ({ ...current, endTime }));
                  setTimeErrors((current) => ({ ...current, endTime: undefined }));
                }}
                placeholder="17:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          </View>
          <ToggleRow title="Available for deliveries" description="Turn off to pause this shift without deleting it." value={form.isAvailable} onChange={(isAvailable) => setForm((current) => ({ ...current, isAvailable }))} />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <AppButton title={editingId ? 'Save changes' : 'Add shift'} icon="checkmark" loading={saving} onPress={save} />
        </Card>
      ) : null}

      {loading ? (
        <LoadingView message="Loading your schedule..." />
      ) : error ? (
        <ErrorView message={error} onRetry={() => reload()} />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No working hours yet"
          message="Add your first shift so your weekly availability is easy to manage."
          actionLabel="Add first shift"
          onAction={openCreate}
        />
      ) : (
        <View style={styles.list}>
          {schedules.map((schedule) => (
            <Card key={schedule.id} style={[styles.shiftCard, !schedule.isAvailable && styles.pausedCard]}>
              <View style={styles.shiftHeader}>
                <View style={[styles.dayBox, !schedule.isAvailable && styles.pausedDayBox]}>
                  <Text style={[styles.dayShort, !schedule.isAvailable && styles.pausedText]}>{DAY_NAMES[schedule.dayOfWeek].slice(0, 3).toUpperCase()}</Text>
                  <Text style={[styles.dayNumber, !schedule.isAvailable && styles.pausedText]}>{schedule.dayOfWeek === 0 ? 7 : schedule.dayOfWeek}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.dayName}>{DAY_NAMES[schedule.dayOfWeek]}</Text>
                  <Text style={styles.shiftTime}>{displayTime(schedule.startTime)} – {displayTime(schedule.endTime)}</Text>
                </View>
                <Badge label={schedule.isAvailable ? 'Active' : 'Paused'} tone={schedule.isAvailable ? 'success' : 'neutral'} />
              </View>
              <View style={styles.actions}>
                <AppButton title={schedule.isAvailable ? 'Pause' : 'Enable'} size="sm" variant="secondary" icon={schedule.isAvailable ? 'pause-outline' : 'play-outline'} flex onPress={() => toggle(schedule)} />
                <AppButton title="Edit" size="sm" variant="outline" icon="create-outline" flex onPress={() => openEdit(schedule)} />
                <AppButton title="Delete" size="sm" variant="ghost" icon="trash-outline" onPress={() => remove(schedule)} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryIcon: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 2,
  },
  summaryValue: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.76)',
  },
  flex: { flex: 1 },
  formCard: { gap: spacing.lg, padding: spacing.lg },
  formHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  formTitle: { ...typography.sectionTitle, color: colors.ink },
  muted: { ...typography.caption, color: colors.muted, marginTop: 2 },
  fieldGroup: { gap: spacing.sm },
  label: { ...typography.label, color: colors.ink },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  error: { ...typography.body, color: colors.danger },
  list: { gap: spacing.md },
  shiftCard: { gap: spacing.md, padding: spacing.lg },
  pausedCard: { backgroundColor: colors.soft },
  shiftHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  dayBox: { alignItems: 'center', backgroundColor: colors.brandSoft, borderRadius: radius.md, height: 52, justifyContent: 'center', width: 52 },
  pausedDayBox: { backgroundColor: colors.line },
  dayShort: { color: colors.brandText, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  dayNumber: { color: colors.brandText, fontSize: 18, fontWeight: '700' },
  pausedText: { color: colors.muted },
  dayName: { ...typography.bodyStrong, color: colors.ink },
  shiftTime: { ...typography.caption, color: colors.muted, marginTop: 3 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
