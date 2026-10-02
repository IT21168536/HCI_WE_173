import type * as SQLite from 'expo-sqlite';

const now = new Date().toISOString();

export async function seedDemoData(db: SQLite.SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');

  if ((existing?.count ?? 0) > 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Amali Perera', 'customer1@test.com', '0771001001', 'demo-password', 'customer', now],
    );
    await db.runAsync(
      'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Nadeesha Silva', 'cook1@test.com', '0772001001', 'demo-password', 'cook', now],
    );
    await db.runAsync(
      'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Kamal Fernando', 'cook2@test.com', '0772001002', 'demo-password', 'cook', now],
    );
    await db.runAsync(
      'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Ruwan Jayasinghe', 'rider1@test.com', '0773001001', 'demo-password', 'rider', now],
    );
    await db.runAsync(
      'INSERT INTO users (full_name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['Sahan Wickrama', 'rider2@test.com', '0773001002', 'demo-password', 'rider', now],
    );

    await db.runAsync(
      'INSERT INTO cook_profiles (user_id, business_name, location, description, hygiene_info, verification_status) VALUES (?, ?, ?, ?, ?, ?)',
      [2, "Nadeesha's Kitchen", 'Nugegoda', 'Traditional rice and curry cooked in small batches.', 'Clean home kitchen, daily fresh produce.', 'verified'],
    );
    await db.runAsync(
      'INSERT INTO cook_profiles (user_id, business_name, location, description, hygiene_info, verification_status) VALUES (?, ?, ?, ?, ?, ?)',
      [3, "Kamal's Homestyle", 'Rajagiriya', 'Comfort meals and healthy lunch packs.', 'Food-safe packaging and separate vegetarian prep.', 'verified'],
    );

    await db.runAsync(
      'INSERT INTO meals (cook_id, name, description, price, category, ingredients, allergens, available_quantity, is_available, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [2, 'Chicken Rice & Curry', 'Home-cooked lunch pack with seasonal vegetables.', 650, 'Lunch', 'Rice, chicken, dhal, mallung, papadam', 'May contain coconut', 8, 1, now],
    );
    await db.runAsync(
      'INSERT INTO meals (cook_id, name, description, price, category, ingredients, allergens, available_quantity, is_available, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [3, 'Vegetarian String Hopper Pack', 'Light dinner pack with potato curry and sambol.', 480, 'Dinner', 'String hoppers, potato curry, coconut sambol', 'Coconut', 6, 1, now],
    );
  });
}
