import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/core/auth/SessionContext';
import { MealForm } from '@/features/cook/components/MealForm';
import { createMeal } from '@/features/cook/services/cook.service';

export default function AddMealScreen() {
  const user = useCurrentUser();

  return (
    <MealForm
      title="Add Meal"
      submitLabel="Save meal"
      onSubmit={async (input) => {
        await createMeal(user.id, input);
        Alert.alert('Meal added', `${input.name} is on your menu.`);
        router.back();
      }}
    />
  );
}
