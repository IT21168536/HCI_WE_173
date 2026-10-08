import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { MealForm } from '@/features/cook/components/MealForm';
import { getMeal, updateMeal } from '@/features/cook/services/cook.service';
import { ErrorView, LoadingView } from '@/shared/components/LoadingView';
import { Screen } from '@/shared/components/Screen';
import { useFocusData } from '@/shared/hooks/useFocusData';

export default function EditMealScreen() {
  const user = useCurrentUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealId = Number(id);

  const { data: meal, loading, error, reload } = useFocusData(
    async () => {
      const found = await getMeal(mealId);
      if (!found || found.cookId !== user.id || found.deletedAt) {
        throw new Error('This meal is not on your menu.');
      }
      return found;
    },
    null,
    [mealId, user.id],
  );

  if (loading) {
    return <LoadingView message="Loading meal..." fill />;
  }
  if (error || !meal) {
    return (
      <Screen title="Edit Meal" back variant="brand">
        <ErrorView message={error ?? 'Meal not found.'} onRetry={() => reload()} />
      </Screen>
    );
  }

  return (
    <MealForm
      key={meal.id}
      title="Edit Meal"
      initial={meal}
      submitLabel="Save changes"
      onSubmit={async (input) => {
        await updateMeal(meal.id, input);
        Alert.alert('Meal updated', `${input.name} has been saved.`);
        router.back();
      }}
      onDelete={() => router.push({ pathname: '/(cook)/meal/[id]/delete', params: { id: String(meal.id) } })}
    />
  );
}
