import type { CookProfile } from '@/shared/types/CookProfile';
import type { Meal } from '@/shared/types/Meal';
import type { Order } from '@/shared/types/Order';
import type { OrderItem } from '@/shared/types/OrderItem';
import type { Review } from '@/shared/types/Review';
import type { User } from '@/shared/types/User';

export function mapUser(row: any): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    address: row.address,
    passwordHash: row.password_hash,
    role: row.role,
    profileImage: row.profile_image,
    createdAt: row.created_at,
  };
}

export function mapCookProfile(row: any): CookProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    location: row.location,
    description: row.description,
    hygieneInfo: row.hygiene_info,
    verificationStatus: row.verification_status ?? 'unverified',
    isOpen: row.is_open !== 0,
    cookName: row.cook_name,
    mobile: row.mobile,
    profileImage: row.profile_image,
    rating: row.rating ?? null,
    reviewCount: row.review_count ?? 0,
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
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cookName: row.cook_name,
    cookLocation: row.cook_location,
    averageRating: row.average_rating ?? null,
    reviewCount: row.review_count ?? 0,
    soldToday: row.sold_today ?? 0,
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
    customerNote: row.customer_note,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    cancelStatus: row.cancel_status,
    cancelReason: row.cancel_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deliveredAt: row.delivered_at,
    riderDeletedAt: row.rider_deleted_at,
    customerName: row.customer_name,
    customerMobile: row.customer_mobile,
    cookName: row.cook_name,
    cookBusinessName: row.cook_business_name,
    cookMobile: row.cook_mobile,
    cookLocation: row.cook_location,
    cookAddress: row.cook_address,
    riderName: row.rider_name,
    riderMobile: row.rider_mobile,
    itemsSummary: row.items_summary,
    itemCount: row.item_count ?? 0,
    hasReview: (row.review_count ?? 0) > 0,
  };
}

export function mapOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    mealId: row.meal_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    mealName: row.meal_name,
  };
}

export function mapReview(row: any): Review {
  return {
    id: row.id,
    orderId: row.order_id,
    customerId: row.customer_id,
    cookId: row.cook_id,
    mealId: row.meal_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    customerName: row.customer_name,
    mealName: row.meal_name,
  };
}
