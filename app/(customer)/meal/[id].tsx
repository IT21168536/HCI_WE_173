import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { LoadingView } from '@/shared/components/LoadingView';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { colors } from '@/shared/theme/colors';
import { screenStyles } from '@/shared/theme/screen';
import type { Meal } from '@/shared/types/Meal';
import { getMealById } from '@/core/repositories/meal.repository';
import { addMealToCustomerCart } from '@/features/customer/services/customerMeal.service';
import { getSessionUser } from '@/core/auth/session.service';

export default function MealDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    getMealById(Number(id)).then(setMeal);
  }, [id]);

  if (!meal) {
    return <LoadingView message="Loading meal..." />;
  }

  const selectedMeal = meal;

  async function addToCart() {
    const user = await getSessionUser();
    if (!user || user.role !== 'customer') {
      Alert.alert('Login required', 'Please login as a customer to add meals to cart.');
      return;
    }

    await addMealToCustomerCart(user.id, selectedMeal.id);
    Alert.alert('Added to cart', `${selectedMeal.name} is ready for checkout.`);
  }

  return (
    <ScrollView style={screenStyles.container} contentContainerStyle={screenStyles.content}>
      <ScreenHeader title={selectedMeal.name} subtitle={`by ${selectedMeal.cookName ?? 'Local cook'}`} />
      <Text>{selectedMeal.description}</Text>
      <Text>Ingredients: {selectedMeal.ingredients ?? 'Ask the cook for details.'}</Text>
      <Text>Allergens: {selectedMeal.allergens ?? 'Not listed'}</Text>
      <Text style={{ color: selectedMeal.availableQuantity > 0 ? colors.success : colors.danger }}>
        {selectedMeal.availableQuantity > 0 ? `${selectedMeal.availableQuantity} portions available` : 'Sold out for today'}
      </Text>
      <AppButton title="Add to cart" onPress={addToCart} disabled={selectedMeal.availableQuantity <= 0} />
    </ScrollView>
  );
}
