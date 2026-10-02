import { Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { screenStyles } from '@/shared/theme/screen';
import { createMeal } from '@/features/cook/services/cookMeal.service';
import { getSessionUser } from '@/core/auth/session.service';

export default function AddMealScreen() {
  async function addDemoMeal() {
    const user = await getSessionUser();
    if (!user || user.role !== 'cook') {
      Alert.alert('Login required', 'Please login as a cook to create meals.');
      return;
    }

    await createMeal({
      cookId: user.id,
      name: 'Homestyle Dhal Rice Bowl',
      price: 420,
      category: 'Lunch',
      ingredients: 'Rice, dhal, tempered onions, greens',
      allergens: 'May contain coconut',
      availableQuantity: 5,
    });
    Alert.alert('Meal added', 'Demo meal created for the cook menu.');
    router.back();
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title="Add meal" subtitle="Meal form scaffold for image, portions, ingredients, and allergens." />
      <AppButton title="Create demo meal" onPress={addDemoMeal} />
    </ScrollView>
  );
}
