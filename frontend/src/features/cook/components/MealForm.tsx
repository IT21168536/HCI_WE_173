import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pickAndStoreImage } from '@/core/storage/image.service';
import { validateMealInput, type MealErrors, type MealInput } from '@/features/cook/services/cook.service';
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
  const [errors, setErrors] = useState<MealErrors>({});
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
    const priceValue = parsePositiveNumber(price);
    const quantityValue = parseWholeNumber(quantity || '0');
    const input: MealInput = {
      name,
      category,
      price: priceValue ?? Number.NaN,
      availableQuantity: quantityValue ?? Number.NaN,
      description,
      ingredients,
      allergens,
      imagePath,
      isAvailable: available,
    };
    const nextErrors = validateMealInput(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || priceValue === null || quantityValue === null) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      await onSubmit(input);
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

      <AppInput label="Meal name" value={name} onChangeText={(value) => { setName(value); setErrors((current) => ({ ...current, name: undefined })); }} placeholder="e.g. Chicken Rice & Curry" maxLength={60} error={errors.name} />

      <View style={styles.group}>
        <Text style={styles.label}>Category</Text>
        <ChipRow>
          {MEAL_CATEGORIES.map((item) => (
            <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </ChipRow>
        {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <AppInput label="Price (Rs)" icon="cash-outline" value={price} onChangeText={(value) => { setPrice(value.replace(/[^\d.]/g, '')); setErrors((current) => ({ ...current, price: undefined })); }} keyboardType="decimal-pad" placeholder="0" maxLength={9} error={errors.price} />
        </View>
        <View style={styles.flex}>
          <AppInput label="Portions today" icon="restaurant-outline" value={quantity} onChangeText={(value) => { setQuantity(value.replace(/\D/g, '').slice(0, 3)); setErrors((current) => ({ ...current, quantity: undefined })); }} keyboardType="number-pad" placeholder="0" maxLength={3} error={errors.quantity} />
        </View>
      </View>

      <AppInput label="Description" value={description} onChangeText={(value) => { setDescription(value); setErrors((current) => ({ ...current, description: undefined })); }} multiline placeholder="What's in it, spice level, portion size" maxLength={300} error={errors.description} />
      <AppInput label="Ingredients" value={ingredients} onChangeText={(value) => { setIngredients(value); setErrors((current) => ({ ...current, ingredients: undefined })); }} placeholder="Rice, chicken, dhal..." maxLength={300} error={errors.ingredients} />
      <AppInput label="Allergens" value={allergens} onChangeText={(value) => { setAllergens(value); setErrors((current) => ({ ...current, allergens: undefined })); }} placeholder="e.g. Coconut, egg, gluten" hint="Customers see this before they order." maxLength={150} error={errors.allergens} />

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
