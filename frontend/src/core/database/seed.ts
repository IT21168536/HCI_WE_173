import type * as SQLite from 'expo-sqlite';

/**
 * Demo data for the assignment walkthrough. Every account uses the password
 * `demo-password`. Seeding only runs on an empty database.
 */

const DELIVERY_FEE = 250;

type SeedOrder = {
  customerId: number;
  cookId: number;
  riderId?: number;
  deliveryType: 'delivery' | 'pickup';
  items: [mealId: number, quantity: number, unitPrice: number][];
  status: string;
  paymentMethod: 'cash' | 'card';
  minutesAgo: number;
  scheduledInMinutes?: number;
  note?: string;
  cancelStatus?: string;
  cancelReason?: string;
  review?: { rating: number; comment: string };
};

const users: [name: string, email: string, mobile: string, address: string | null, role: string][] = [
  ['Amali Perera', 'customer1@test.com', '0771001001', '125/4 Lake Road, Malabe', 'customer'],
  ['Nadeesha Perera', 'cook1@test.com', '0772001001', 'No. 18, Malabe Road, Malabe', 'cook'],
  ['Kamal Fernando', 'cook2@test.com', '0772001002', '22 Parliament Road, Rajagiriya', 'cook'],
  ['Amal Perera', 'rider1@test.com', '0773001001', null, 'rider'],
  ['Sahan Wickrama', 'rider2@test.com', '0773001002', null, 'rider'],
  ['Chathura Lakshan', 'customer2@test.com', '0771001002', '18/2 Temple Road, Malabe', 'customer'],
  ['Kavindi Silva', 'customer3@test.com', '0771001003', 'No. 42, Temple Road, Malabe', 'customer'],
  ['Dinuka Perera', 'customer4@test.com', '0771001004', '56 Kaduwela Road, Battaramulla', 'customer'],
  ['Kasun Silva', 'customer5@test.com', '0771001005', '7 Station Lane, Kaduwela', 'customer'],
];

// [cookId, name, description, price, category, ingredients, allergens, quantity, available]
const meals: [number, string, string, number, string, string, string, number, number][] = [
  [2, 'Rice & Curry (Chicken)', 'Steamed rice with chicken curry, dhal, three vegetables and pol sambol.', 450, 'Rice & Curry', 'Rice, chicken, dhal, beans, mallung, pol sambol', 'Coconut', 12, 1],
  [2, 'Chicken Kottu', 'Chopped godamba roti tossed with chicken, egg, leeks and curry gravy.', 650, 'Dinner', 'Godamba roti, chicken, egg, leeks, carrot', 'Egg, gluten', 7, 1],
  [2, 'String Hoppers (10 nos)', 'Soft string hoppers with potato curry, coconut sambol and kiri hodi.', 450, 'Breakfast', 'Rice flour, potato, coconut, onion', 'Coconut', 15, 1],
  [2, 'Pol Rotti (4 nos)', 'Griddled coconut rotti served with lunu miris and dhal curry.', 550, 'Traditional', 'Wheat flour, coconut, onion, chilli, dhal', 'Gluten, coconut', 20, 1],
  [2, 'Pittu', 'Steamed rice-flour and coconut pittu with fish curry and coconut milk.', 350, 'Traditional', 'Rice flour, coconut, fish curry', 'Fish, coconut', 0, 0],
  [3, 'Vegetarian String Hopper Pack', 'Light dinner pack with potato curry and sambol.', 480, 'Vegetarian', 'String hoppers, potato curry, coconut sambol', 'Coconut', 6, 1],
  [3, 'Red Rice Healthy Bowl', 'Red rice, gotukola sambol, lentils and grilled fish.', 520, 'Healthy', 'Red rice, gotukola, lentils, fish', 'Fish', 8, 1],
  [3, 'Watalappan', 'Kithul jaggery and coconut custard with cashews.', 250, 'Desserts', 'Coconut milk, kithul jaggery, egg, cashew', 'Egg, nuts', 10, 1],
];

const day = 24 * 60;

const orders: SeedOrder[] = [
  // Live orders for Nadeesha Kitchen (cook1)
  { customerId: 7, cookId: 2, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'requested', paymentMethod: 'card', minutesAgo: 2, note: 'Less spicy lunu miris, please.' },
  { customerId: 6, cookId: 2, deliveryType: 'delivery', items: [[2, 1, 650]], status: 'requested', paymentMethod: 'cash', minutesAgo: 5 },
  { customerId: 8, cookId: 2, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'preparing', paymentMethod: 'card', minutesAgo: 35 },
  { customerId: 7, cookId: 2, deliveryType: 'delivery', items: [[3, 2, 450]], status: 'ready', paymentMethod: 'cash', minutesAgo: 50 },
  {
    customerId: 9, cookId: 2, deliveryType: 'delivery', items: [[2, 1, 650]], status: 'accepted', paymentMethod: 'card', minutesAgo: 20,
    cancelStatus: 'requested', cancelReason: "Change of delivery time — I won't be home until 9 PM.",
  },
  // Scheduled pre-orders
  { customerId: 6, cookId: 2, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'requested', paymentMethod: 'cash', minutesAgo: 30, scheduledInMinutes: day + 6 * 60 },
  { customerId: 8, cookId: 2, deliveryType: 'pickup', items: [[3, 2, 450]], status: 'accepted', paymentMethod: 'card', minutesAgo: 180, scheduledInMinutes: 2 * day },
  // Customer1 (Amali) tracking + reviewable order
  { customerId: 1, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[4, 1, 550]], status: 'on_the_way', paymentMethod: 'card', minutesAgo: 70 },
  { customerId: 1, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'delivered', paymentMethod: 'cash', minutesAgo: 2 * day },
  // Completed history (feeds sales, history and reviews)
  { customerId: 6, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'delivered', paymentMethod: 'card', minutesAgo: 180 },
  { customerId: 9, cookId: 2, deliveryType: 'pickup', items: [[2, 1, 650]], status: 'delivered', paymentMethod: 'cash', minutesAgo: 240 },
  { customerId: 6, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[1, 2, 450]], status: 'delivered', paymentMethod: 'card', minutesAgo: day + 120, review: { rating: 5, comment: 'Tastes just like a home-cooked Sunday lunch. The chicken curry was tender.' } },
  { customerId: 9, cookId: 2, riderId: 5, deliveryType: 'delivery', items: [[2, 1, 650]], status: 'delivered', paymentMethod: 'cash', minutesAgo: day + 300, review: { rating: 5, comment: 'Arrived hot and well packed. Big portion for the price.' } },
  { customerId: 7, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[3, 2, 450]], status: 'delivered', paymentMethod: 'card', minutesAgo: 2 * day + 60, review: { rating: 4, comment: 'Hoppers were soft and fresh. Sambol could be a little spicier.' } },
  { customerId: 8, cookId: 2, deliveryType: 'pickup', items: [[4, 1, 550]], status: 'delivered', paymentMethod: 'cash', minutesAgo: 3 * day, review: { rating: 5, comment: 'Best pol rotti in Malabe. Will order again.' } },
  { customerId: 6, cookId: 2, riderId: 5, deliveryType: 'delivery', items: [[1, 3, 450]], status: 'delivered', paymentMethod: 'card', minutesAgo: 4 * day },
  { customerId: 7, cookId: 2, riderId: 4, deliveryType: 'delivery', items: [[2, 2, 650]], status: 'delivered', paymentMethod: 'card', minutesAgo: 5 * day, review: { rating: 5, comment: 'Kottu was perfect for a late dinner.' } },
  { customerId: 9, cookId: 2, deliveryType: 'pickup', items: [[3, 1, 450]], status: 'delivered', paymentMethod: 'cash', minutesAgo: 6 * day },
  { customerId: 8, cookId: 2, deliveryType: 'delivery', items: [[5, 2, 350]], status: 'cancelled', paymentMethod: 'cash', minutesAgo: 2 * day + 200, cancelReason: 'Cook declined: sold out.' },
  // Kamal's Homestyle (cook2)
  { customerId: 1, cookId: 3, riderId: 5, deliveryType: 'delivery', items: [[6, 1, 480]], status: 'delivered', paymentMethod: 'card', minutesAgo: day + 90, review: { rating: 4, comment: 'Light and tasty dinner pack.' } },
  { customerId: 6, cookId: 3, riderId: 5, deliveryType: 'delivery', items: [[7, 1, 520], [8, 2, 250]], status: 'delivered', paymentMethod: 'card', minutesAgo: 3 * day, review: { rating: 5, comment: 'Healthy bowl and the watalappan was a treat.' } },
];

function iso(minutesFromNow: number) {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}

export async function seedDemoData(db: SQLite.SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if ((existing?.count ?? 0) > 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    const createdAt = iso(-30 * day);

    for (const [name, email, mobile, address, role] of users) {
      await db.runAsync(
        'INSERT INTO users (full_name, email, mobile, address, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, mobile, address, 'demo-password', role, createdAt],
      );
    }

    await db.runAsync(
      'INSERT INTO cook_profiles (user_id, business_name, location, description, hygiene_info, verification_status, is_open) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [2, 'Nadeesha Kitchen', 'Malabe', 'Home-style Sri Lankan rice & curry, kottu and hoppers, made fresh every day.', 'Registered home kitchen. Fresh produce bought every morning, food-safe packaging.', 'verified', 1],
    );
    await db.runAsync(
      'INSERT INTO cook_profiles (user_id, business_name, location, description, hygiene_info, verification_status, is_open) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [3, "Kamal's Homestyle", 'Rajagiriya', 'Comfort meals, healthy bowls and traditional desserts.', 'Separate vegetarian prep area and sealed packaging.', 'verified', 1],
    );

    await db.runAsync(
      `INSERT INTO rider_profiles
        (user_id, vehicle_type, vehicle_number, license_number, emergency_contact, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [4, 'motorcycle', 'WP BCD-4582', 'B1234567', '0774001001', createdAt, createdAt],
    );
    await db.runAsync(
      `INSERT INTO rider_profiles
        (user_id, vehicle_type, vehicle_number, license_number, emergency_contact, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [5, 'scooter', 'WP CAF-2190', 'B7654321', '0774001002', createdAt, createdAt],
    );

    for (const dayOfWeek of [1, 2, 3, 4, 5]) {
      await db.runAsync(
        `INSERT INTO rider_schedules
          (rider_id, day_of_week, start_time, end_time, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [4, dayOfWeek, '08:00', '17:00', createdAt, createdAt],
      );
    }

    for (const [cookId, name, description, price, category, ingredients, allergens, quantity, available] of meals) {
      await db.runAsync(
        `INSERT INTO meals (cook_id, name, description, price, category, ingredients, allergens, available_quantity, is_available, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cookId, name, description, price, category, ingredients, allergens, quantity, available, createdAt],
      );
    }

    for (const order of orders) {
      const subtotal = order.items.reduce((sum, [, quantity, unitPrice]) => sum + quantity * unitPrice, 0);
      const deliveryFee = order.deliveryType === 'delivery' ? DELIVERY_FEE : 0;
      const created = iso(-order.minutesAgo);
      const customer = users[order.customerId - 1];
      const isDone = order.status === 'delivered';
      const paid = order.paymentMethod === 'card' || isDone;
      const paymentStatus = order.status === 'cancelled' ? (order.paymentMethod === 'card' ? 'refunded' : 'pending') : paid ? 'paid' : 'pending';

      const result = await db.runAsync(
        `INSERT INTO orders
          (customer_id, cook_id, rider_id, delivery_type, delivery_address, scheduled_time, customer_note, subtotal, delivery_fee, total,
           payment_method, payment_status, status, cancel_status, cancel_reason, created_at, updated_at, delivered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.customerId,
          order.cookId,
          order.riderId ?? null,
          order.deliveryType,
          order.deliveryType === 'delivery' ? customer[3] : null,
          order.scheduledInMinutes ? iso(order.scheduledInMinutes) : null,
          order.note ?? null,
          subtotal,
          deliveryFee,
          subtotal + deliveryFee,
          order.paymentMethod,
          paymentStatus,
          order.status,
          order.cancelStatus ?? null,
          order.cancelReason ?? null,
          created,
          created,
          isDone ? iso(-order.minutesAgo + 45) : null,
        ],
      );

      const orderId = result.lastInsertRowId;
      for (const [mealId, quantity, unitPrice] of order.items) {
        await db.runAsync('INSERT INTO order_items (order_id, meal_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [
          orderId,
          mealId,
          quantity,
          unitPrice,
        ]);
      }

      if (order.review) {
        await db.runAsync(
          'INSERT INTO reviews (order_id, customer_id, cook_id, meal_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, order.customerId, order.cookId, order.items[0][0], order.review.rating, order.review.comment, iso(-order.minutesAgo + 120)],
        );
      }
    }

    await db.runAsync('INSERT INTO favorites (customer_id, meal_id, created_at) VALUES (?, ?, ?)', [1, 1, createdAt]);
    await db.runAsync('INSERT INTO favorites (customer_id, meal_id, created_at) VALUES (?, ?, ?)', [1, 7, createdAt]);
  });
}
