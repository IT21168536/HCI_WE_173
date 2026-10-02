import type { Meal } from '@/shared/types/Meal';
import type { Order } from '@/shared/types/Order';
import type { User } from '@/shared/types/User';

export function mapUser(row: any): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    passwordHash: row.password_hash,
    role: row.role,
    profileImage: row.profile_image,
    createdAt: row.created_at,
  };
}

export function mapMeal(row: any): Meal {
  return {
    id: row.id,
    cookId: row.cook_id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    ingredients: row.ingredients,
    allergens: row.allergens,
    imagePath: row.image_path,
    availableQuantity: row.available_quantity,
    isAvailable: row.is_available === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cookName: row.cook_name,
    cookLocation: row.cook_location,
    averageRating: row.average_rating,
  };
}

export function mapOrder(row: any): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    cookId: row.cook_id,
    riderId: row.rider_id,
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address,
    scheduledTime: row.scheduled_time,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name,
    cookName: row.cook_name,
    cookLocation: row.cook_location,
  };
}
