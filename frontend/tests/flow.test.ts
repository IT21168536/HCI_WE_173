import assert from 'node:assert/strict';
import { getDatabase } from '@/core/database/database';
import { login, register, resetPassword } from '@/core/auth/auth.service';
import { listAvailableMeals, listMealsByCook, getMealById, deleteMeal, setMealAvailability, validateMealInput } from '@/core/repositories/meal.repository';
import { addToCart, listCart, countCartItems } from '@/core/repositories/cart.repository';
import { placeOrdersFromCart, updateOrderStatus, listAvailableDeliveries, claimDelivery, getOrderById, cancelOrderByCustomer, resolveCancellation, listOrdersForCook, listActiveDeliveriesForRider, getRiderStats, listRiderHistory, listOrderItems, deleteRiderHistoryEntry, listOrdersForCustomer } from '@/core/repositories/order.repository';
import { createRiderSchedule, deleteRiderSchedule, getRiderProfile, listRiderSchedules, updateRiderSchedule, upsertRiderProfile } from '@/core/repositories/rider.repository';
import { createRiderSchedule as createValidatedSchedule, saveRiderAccount, saveRiderProfile } from '@/features/rider/services/rider.service';
import { createReview, getRatingSummary, listReviewsForCook } from '@/core/repositories/review.repository';
import { getCookStats, getCookDailySales, getCookTopMeals, getCookSalesSince, getCookProfile, upsertCookProfile } from '@/core/repositories/cook.repository';
import { updateUser } from '@/core/repositories/user.repository';
import { toggleFavorite, listFavoriteMeals } from '@/core/repositories/favorite.repository';

let passed = 0;
async function step(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('  ✓', name); }
  catch (e) { console.log('  ✗', name); throw e; }
}
async function rejects(p: Promise<unknown>, re: RegExp) { await assert.rejects(p, re); }

(async () => {
  const db = await getDatabase();
  const COOK = 2, COOK2 = 3, RIDER = 4, RIDER2 = 5, CUSTOMER = 1;

  await step('seed: 9 users, 8 meals, live orders', async () => {
    assert.equal((await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) c FROM users'))!.c, 9);
    assert.equal((await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) c FROM meals'))!.c, 8);
    const orders = await listOrdersForCook(COOK);
    assert.ok(orders.some((o) => o.status === 'requested'));
    assert.ok(orders.some((o) => o.cancelStatus === 'requested'));
  });

  await step('login with demo password; wrong password rejected', async () => {
    const u = await login('customer1@test.com', 'demo-password');
    assert.equal(u.role, 'customer');
    await rejects(login('customer1@test.com', 'nope'), /do not match/);
  });

  await step('register cook → pending kitchen; hashed password logs in', async () => {
    const u = await register({ fullName: 'Test Cook', email: 'newcook@test.com', mobile: '0779998888', address: '15 Lake Road, Kandy', password: 'secret1', role: 'cook', kitchen: { businessName: 'Test Kitchen', location: 'Kandy' } });
    const profile = await getCookProfile(u.id);
    assert.equal(profile?.verificationStatus, 'pending');
    const stored = await db.getFirstAsync<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', [u.id]);
    assert.match(stored!.password_hash, /^sha256:/);
    assert.equal((await login('newcook@test.com', 'secret1')).id, u.id);
    await rejects(register({ fullName: 'Test Customer', email: 'newcook@test.com', mobile: '0771112222', address: '20 Main Street, Kandy', password: 'secret1', role: 'customer' }), /already exists/);
  });

  await step('customer and cook registration reject invalid entered data', async () => {
    await rejects(register({ fullName: 'Customer 7', email: 'bad', mobile: '07712', address: 'A', password: 'secret', role: 'customer' }), /valid name/);
    await rejects(register({ fullName: 'Valid Customer', email: 'valid@test.com', mobile: '07712', address: '20 Main Street', password: 'secret1', role: 'customer' }), /exactly 10 digits/);
    await rejects(register({ fullName: 'Valid Cook', email: 'cookvalid@test.com', mobile: '0771112222', address: '20 Main Street', password: 'secret1', role: 'cook', kitchen: { businessName: 'K', location: '' } }), /kitchen name/);
  });

  await step('customer profile and cook data reject invalid direct database writes', async () => {
    await rejects(updateUser(CUSTOMER, { fullName: 'Customer 1', mobile: '07123', address: 'A' }), /valid name|exactly 10 digits|complete address/);
    await rejects(upsertCookProfile(COOK, { businessName: 'K', location: '', description: 'x'.repeat(301) }), /kitchen name/);
    const errors = validateMealInput({ name: 'X', category: 'Unknown', price: -1, availableQuantity: 2.5, description: 'Short', ingredients: '', allergens: 'x'.repeat(151), isAvailable: true });
    assert.deepEqual(Object.keys(errors).sort(), ['allergens', 'category', 'description', 'ingredients', 'name', 'price', 'quantity']);
  });

  await step('reset password needs matching phone', async () => {
    await rejects(resetPassword('newcook@test.com', '0710000000', 'newpass1'), /could not find/);
    await resetPassword('newcook@test.com', '077 999 8888', 'newpass1');
    await login('newcook@test.com', 'newpass1');
  });

  await step('browse: sold-out hidden, filters work', async () => {
    const all = await listAvailableMeals();
    assert.ok(!all.some((m) => m.name === 'Pittu'));
    assert.deepEqual((await listAvailableMeals({ category: 'Breakfast' })).map((m) => m.name), ['String Hoppers (10 nos)']);
    assert.deepEqual((await listAvailableMeals({ maxPrice: 400 })).map((m) => m.name), ['Watalappan']);
    assert.ok((await listAvailableMeals({ query: 'kottu' })).length === 1);
    assert.ok((await listAvailableMeals({ location: 'Rajagiriya' })).every((m) => m.cookId === COOK2));
    const rated = all.find((m) => m.cookId === COOK)!;
    assert.ok(rated.averageRating! > 4 && rated.reviewCount! > 0);
  });

  await step('favourites toggle', async () => {
    const before = (await listFavoriteMeals(CUSTOMER)).length;
    assert.equal(await toggleFavorite(CUSTOMER, 3), true);
    assert.equal((await listFavoriteMeals(CUSTOMER)).length, before + 1);
    assert.equal(await toggleFavorite(CUSTOMER, 3), false);
  });

  let orderA = 0, orderB = 0;
  await step('checkout splits per kitchen, reserves portions, empties cart', async () => {
    const before = (await getMealById(1))!.availableQuantity;
    await addToCart(CUSTOMER, 1, 2);
    await addToCart(CUSTOMER, 6, 1);
    assert.equal(await countCartItems(CUSTOMER), 3);
    const ids = await placeOrdersFromCart(CUSTOMER, { deliveryType: 'delivery', deliveryAddress: '125/4 Lake Road', paymentMethod: 'cash' });
    assert.equal(ids.length, 2);
    [orderA, orderB] = ids;
    assert.equal(await countCartItems(CUSTOMER), 0);
    assert.equal((await getMealById(1))!.availableQuantity, before - 2);
    const a = (await getOrderById(orderA))!;
    assert.equal(a.subtotal, 900); assert.equal(a.deliveryFee, 250); assert.equal(a.total, 1150);
    assert.equal(a.status, 'requested'); assert.equal(a.paymentStatus, 'pending');
    assert.equal(a.itemsSummary, 'Rice & Curry (Chicken) ×2');
  });

  await step('checkout blocks oversold and missing address; cart untouched', async () => {
    const left = (await getMealById(2))!.availableQuantity;
    await addToCart(CUSTOMER, 2, left + 1);
    await rejects(placeOrdersFromCart(CUSTOMER, { deliveryType: 'pickup', paymentMethod: 'cash' }), /Only \d+ portions/);
    assert.equal((await listCart(CUSTOMER)).length, 1);
    assert.equal((await getMealById(2))!.availableQuantity, left);
    await rejects(placeOrdersFromCart(CUSTOMER, { deliveryType: 'delivery', deliveryAddress: ' ', paymentMethod: 'cash' }), /delivery address/);
    await db.runAsync('DELETE FROM cart_items WHERE customer_id = ?', [CUSTOMER]);
  });

  await step('cook flow: accept → preparing → ready; invalid jumps rejected', async () => {
    await rejects(updateOrderStatus(orderA, 'ready'), /already requested/);
    await updateOrderStatus(orderA, 'accepted');
    await updateOrderStatus(orderA, 'preparing');
    await rejects(updateOrderStatus(orderA, 'delivered'), /already preparing/);
    await updateOrderStatus(orderA, 'ready');
    await rejects(updateOrderStatus(orderA, 'delivered'), /rider must pick up/);
  });

  await step('rider flow: claim (once) → pickup → on the way → delivered; cash marked paid', async () => {
    assert.ok((await listAvailableDeliveries()).some((o) => o.id === orderA));
    await claimDelivery(orderA, RIDER);
    await rejects(claimDelivery(orderA, RIDER2), /Another rider/);
    assert.ok(!(await listAvailableDeliveries()).some((o) => o.id === orderA));
    assert.ok((await listActiveDeliveriesForRider(RIDER)).some((o) => o.id === orderA));
    await rejects(updateOrderStatus(orderA, 'picked_up', RIDER2), /Another rider/);
    await updateOrderStatus(orderA, 'picked_up', RIDER);
    await updateOrderStatus(orderA, 'on_the_way', RIDER);
    await updateOrderStatus(orderA, 'delivered', RIDER);
    const a = (await getOrderById(orderA))!;
    assert.equal(a.status, 'delivered'); assert.equal(a.paymentStatus, 'paid'); assert.ok(a.deliveredAt);
    assert.equal(a.riderName, 'Amal Perera');
    const stats = await getRiderStats(RIDER);
    assert.ok(stats.completedToday >= 1 && stats.earningsToday >= 250);
    assert.ok((await listRiderHistory(RIDER)).some((o) => o.id === orderA));
  });

  await step('rider profile: read seeded details and update vehicle', async () => {
    const seeded = await getRiderProfile(RIDER);
    assert.equal(seeded?.vehicleType, 'motorcycle');
    await upsertRiderProfile(RIDER, {
      vehicleType: 'scooter', vehicleNumber: 'wp test-1001', licenseNumber: 'b998877', emergencyContact: '0771234567',
    });
    const updated = await getRiderProfile(RIDER);
    assert.equal(updated?.vehicleType, 'scooter');
    assert.equal(updated?.vehicleNumber, 'WP TEST-1001');
    assert.equal(updated?.emergencyContact, '0771234567');
  });

  await step('rider schedule CRUD: create, read, update and delete a shift', async () => {
    const created = await createRiderSchedule(RIDER, { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true });
    assert.ok((await listRiderSchedules(RIDER)).some((shift) => shift.id === created.id));
    const updated = await updateRiderSchedule(created.id, RIDER, { dayOfWeek: 6, startTime: '10:00', endTime: '15:00', isAvailable: false });
    assert.equal(updated.startTime, '10:00');
    assert.equal(updated.isAvailable, false);
    await deleteRiderSchedule(created.id, RIDER);
    assert.ok(!(await listRiderSchedules(RIDER)).some((shift) => shift.id === created.id));
  });

  await step('rider validation rejects bad times, overlaps and invalid contacts', async () => {
    await rejects(createValidatedSchedule(RIDER, { dayOfWeek: 6, startTime: '18:00', endTime: '09:00', isAvailable: true }), /End time/);
    await rejects(createValidatedSchedule(RIDER, { dayOfWeek: 1, startTime: '10:00', endTime: '12:00', isAvailable: true }), /overlaps/);
    await rejects(saveRiderProfile(RIDER, { vehicleType: 'motorcycle', vehicleNumber: '', licenseNumber: 'B1' }), /registration/);
    await rejects(saveRiderProfile(RIDER, { vehicleType: 'bicycle', emergencyContact: '123' }), /Emergency contact/);
    await rejects(saveRiderProfile(RIDER, { vehicleType: 'motorcycle', vehicleNumber: 'WP BCD-4582', licenseNumber: 'B123456', emergencyContact: '0771234567' }), /seven digits/);
    await rejects(saveRiderProfile(RIDER, { vehicleType: 'motorcycle', vehicleNumber: 'INVALID', licenseNumber: 'B1234567', emergencyContact: '0771234567' }), /vehicle number/);
    await rejects(saveRiderAccount(RIDER, {
      fullName: 'Amal Perera', mobile: '077123456', address: 'Malabe', profileImage: null,
      vehicleType: 'motorcycle', vehicleNumber: 'WP BCD-4582', licenseNumber: 'B1234567', emergencyContact: '0777654321',
    }), /10 digits/);
  });

  await step('rider history delete hides only the rider copy', async () => {
    const target = (await listRiderHistory(RIDER)).find((order) => order.status === 'delivered' && order.id !== orderA)!;
    await deleteRiderHistoryEntry(target.id, RIDER);
    assert.ok(!(await listRiderHistory(RIDER)).some((order) => order.id === target.id));
    assert.ok((await listOrdersForCustomer(target.customerId)).some((order) => order.id === target.id));
    assert.equal((await getOrderById(target.id))?.status, 'delivered');
  });

  await step('review: only after delivery, only once', async () => {
    await rejects(createReview({ orderId: orderB, customerId: CUSTOMER, rating: 5 }), /after it is delivered/);
    const before = await getRatingSummary(COOK);
    await createReview({ orderId: orderA, customerId: CUSTOMER, rating: 4, comment: 'Nice' });
    await rejects(createReview({ orderId: orderA, customerId: CUSTOMER, rating: 5 }), /already reviewed/);
    const after = await getRatingSummary(COOK);
    assert.equal(after.count, before.count + 1);
    assert.equal((await getOrderById(orderA))!.hasReview, true);
    assert.equal((await listReviewsForCook(COOK, 1))[0].customerName, 'Amali Perera');
  });

  await step('customer cancels a new order instantly; portions restored', async () => {
    const before = (await getMealById(6))!.availableQuantity;
    assert.equal(await cancelOrderByCustomer(orderB, CUSTOMER, 'Ordered by mistake'), 'cancelled');
    const b = (await getOrderById(orderB))!;
    assert.equal(b.status, 'cancelled'); assert.equal(b.cancelReason, 'Ordered by mistake');
    assert.equal((await getMealById(6))!.availableQuantity, before + 1);
  });

  await step('cancel after acceptance needs cook approval; approve refunds card', async () => {
    await addToCart(CUSTOMER, 3, 1);
    const [id] = await placeOrdersFromCart(CUSTOMER, { deliveryType: 'delivery', deliveryAddress: 'Lake Road', paymentMethod: 'card' });
    await updateOrderStatus(id, 'accepted');
    const before = (await getMealById(3))!.availableQuantity;
    assert.equal(await cancelOrderByCustomer(id, CUSTOMER, 'Change of plans'), 'requested');
    await rejects(cancelOrderByCustomer(id, CUSTOMER, 'again'), /already asked/);
    assert.ok((await getCookStats(COOK)).pendingCancellations >= 2);
    await resolveCancellation(id, true);
    const o = (await getOrderById(id))!;
    assert.equal(o.status, 'cancelled'); assert.equal(o.paymentStatus, 'refunded'); assert.equal(o.cancelStatus, 'approved');
    assert.equal((await getMealById(3))!.availableQuantity, before + 1);
  });

  await step('cook rejects a cancellation; order continues', async () => {
    const seeded = (await listOrdersForCook(COOK)).find((o) => o.cancelStatus === 'requested')!;
    await resolveCancellation(seeded.id, false);
    const o = (await getOrderById(seeded.id))!;
    assert.equal(o.cancelStatus, 'rejected'); assert.equal(o.status, 'accepted');
    await updateOrderStatus(seeded.id, 'preparing');
  });

  await step('cook declines a new order; card refunded, portions back', async () => {
    const seeded = (await listOrdersForCook(COOK)).find((o) => o.status === 'requested' && o.paymentStatus === 'paid')!;
    const item = (await listOrderItems(seeded.id))[0];
    const before = (await getMealById(item.mealId))!.availableQuantity;
    await updateOrderStatus(seeded.id, 'cancelled');
    const o = (await getOrderById(seeded.id))!;
    assert.equal(o.status, 'cancelled'); assert.equal(o.paymentStatus, 'refunded');
    assert.equal((await getMealById(item.mealId))!.availableQuantity, before + item.quantity);
  });

  await step('pickup order: cook marks collected; rider cannot pick it up', async () => {
    await addToCart(CUSTOMER, 4, 1);
    const [id] = await placeOrdersFromCart(CUSTOMER, { deliveryType: 'pickup', paymentMethod: 'cash' });
    assert.equal((await getOrderById(id))!.deliveryFee, 0);
    await updateOrderStatus(id, 'accepted'); await updateOrderStatus(id, 'preparing'); await updateOrderStatus(id, 'ready');
    assert.ok(!(await listAvailableDeliveries()).some((o) => o.id === id));
    await rejects(updateOrderStatus(id, 'picked_up', RIDER), /collects this order/);
    await updateOrderStatus(id, 'delivered');
    assert.equal((await getOrderById(id))!.paymentStatus, 'paid');
  });

  await step('cook stats, 7-day series and top meals add up', async () => {
    const stats = await getCookStats(COOK);
    const daily = await getCookDailySales(COOK, 7);
    assert.equal(daily.length, 7);
    const today = daily[6];
    assert.equal(today.orders, stats.todayOrders);
    assert.equal(today.total, stats.todaySales);
    const top = await getCookTopMeals(COOK, 0, 10);
    assert.equal(top.reduce((s, m) => s + m.total, 0), stats.todaySales);
    const week = await getCookSalesSince(COOK, 7);
    assert.ok(Math.abs(week.total - daily.reduce((s, d) => s + d.total, 0)) < 1e-6 || week.total >= daily.reduce((s, d) => s + d.total, 0) - 1);
    assert.ok(stats.rating! > 4);
  });

  await step('sold out and delete meal (soft)', async () => {
    await setMealAvailability(4, 0, false);
    assert.ok(!(await listAvailableMeals()).some((m) => m.id === 4));
    await addToCart(CUSTOMER, 7, 1);
    await deleteMeal(7);
    assert.ok(!(await listMealsByCook(COOK2)).some((m) => m.id === 7));
    assert.equal((await listCart(CUSTOMER)).length, 0);
    assert.ok((await getMealById(7))!.deletedAt);
    // past orders still show the meal name
    const hist = await db.getFirstAsync<{ items_summary: string }>(`SELECT (SELECT GROUP_CONCAT(meals.name) FROM order_items JOIN meals ON meals.id = order_items.meal_id WHERE order_items.order_id = orders.id) items_summary FROM orders WHERE id = (SELECT order_id FROM order_items WHERE meal_id = 7 LIMIT 1)`);
    assert.match(hist!.items_summary, /Red Rice/);
  });

  console.log(`\n${passed} checks passed`);
})().catch((e) => { console.error('\nFAILED:', e); process.exit(1); });
