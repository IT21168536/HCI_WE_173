import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pickAndStoreImage } from '@/core/storage/image.service';
import type { MealInput } from '@/features/cook/services/cook.service';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { Icon } from '@/shared/components/Icon';
import { MealImage } from '@/shared/components/MealImage';
import { Screen } from '@/shared/components/Screen';
import { Chip, ChipRow, IconCircle, ToggleRow } from '@/shared/components/ui';
import { colors } from '@/shared/theme/colors';
import { radius } from '@/shared/theme/radius';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { MEAL_CATEGORIES, type Meal } from '@/shared/types/Meal';
import { errorMessage, showError } from '@/shared/utils/alerts';
import { parsePositiveNumber, parseWholeNumber } from '@/shared/utils/validators';

type MealFormProps = {
  title: string;
  initial?: Meal | null;
  submitLabel: string;
  onSubmit: (input: MealInput) => Promise<void>;
  /** Shown under the save button on the edit screen. */
  onDelete?: () => void;
};

type Errors = Partial<Record<'name' | 'price' | 'quantity', string>>;

export function MealForm({ title, initial, submitLabel, onSubmit, onDelete }: MealFormProps) {
  const [imagePath, setImagePath] = useState<string | null>(initial?.imagePath ?? null);
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<string | null>(initial?.category ?? 'Rice & Curry');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [quantity, setQuantity] = useState(initial ? String(initial.availableQuantity) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? '');
  const [allergens, setAllergens] = useState(initial?.allergens ?? '');
  const [available, setAvailable] = useState(initial ? initial.isAvailable : true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickPhoto() {
    try {
      const stored = await pickAndStoreImage('meals');
      if (stored) setImagePath(stored);
    } catch (err) {
      showError('Could not add photo', err);
    }
  }

  async function submit() {
    const nextErrors: Errors = {};
    const priceValue = parsePositiveNumber(price);
    const quantityValue = parseWholeNumber(quantity || '0');
    if (!name.trim()) nextErrors.name = 'Enter a meal name.';
    if (priceValue === null) nextErrors.price = 'Enter a price above 0.';
    if (quantityValue === null) nextErrors.quantity = 'Enter a whole number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || priceValue === null || quantityValue === null) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      await onSubmit({
        name,
        category,
        price: priceValue,
        availableQuantity: quantityValue,
        description,
        ingredients,
        allergens,
        imagePath,
        isAvailable: available,
      });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      title={title}
      back
      variant="brand"
      background={colors.surface}
      footer={
        <>
          {formError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {formError}
            </Text>
          ) : null}
          <AppButton title={submitLabel} loading={saving} onPress={submit} />
          {onDelete ? <AppButton title="Delete meal" variant="ghost" icon="trash-outline" onPress={onDelete} /> : null}
        </>
      }
    >
      {imagePath ? (
        <View>
          <MealImage uri={imagePath} height={140} rounded={radius.lg} />
          <Pressable accessibilityRole="button" accessibilityLabel="Change meal photo" onPress={pickPhoto} style={styles.changePhoto}>
            <Icon name="camera-outline" size={14} color={colors.brandText} />
            <Text style={styles.changePhotoText}>Change photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="Upload meal photo" onPress={pickPhoto} style={styles.upload}>
          <IconCircle icon="camera-outline" size={44} />
          <Text style={styles.uploadTitle}>Upload meal photo</Text>
          <Text style={styles.muted}>JPG or PNG from your gallery</Text>
        </Pressable>
      )}

      <AppInput label="Meal name" value={name} onChangeText={setName} placeholder="e.g. Chicken Rice & Curry" error={errors.name} />

      <View style={styles.group}>
        <Text style={styles.label}>Category</Text>
        <ChipRow>
          {MEAL_CATEGORIES.map((item) => (
            <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </ChipRow>
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <AppInput label="Price (Rs)" icon="cash-outline" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0" error={errors.price} />
        </View>
        <View style={styles.flex}>
          <AppInput label="Portions today" icon="restaurant-outline" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="0" error={errors.quantity} />
        </View>
      </View>

      <AppInput label="Description" value={description} onChangeText={setDescription} multiline placeholder="What's in it, spice level, portion size" />
      <AppInput label="Ingredients" value={ingredients} onChangeText={setIngredients} placeholder="Rice, chicken, dhal..." />
      <AppInput label="Allergens" value={allergens} onChangeText={setAllergens} placeholder="e.g. Coconut, egg, gluten" hint="Customers see this before they order." />

      <ToggleRow
        title="Available for orders"
        description={available ? 'Customers can order this meal today' : 'Hidden from customers until you turn it on'}
        value={available}
        onChange={setAvailable}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.ink,
  },
  muted: {
    ...typography.caption,
    color: colors.muted,
  },
  upload: {
    alignItems: 'center',
    backgroundColor: '#FFF4F1',
    borderColor: colors.brandStrong,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    gap: 6,
    justifyContent: 'center',
    minHeight: 124,
  },
  uploadTitle: {
    ...typography.bodyStrong,
    color: colors.brandText,
  },
  changePhoto: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    bottom: spacing.sm,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: spacing.sm,
  },
  changePhotoText: {
    ...typography.captionStrong,
    color: colors.brandText,
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
