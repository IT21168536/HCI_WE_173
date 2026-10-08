/**
 * Delivery rider feature API (Member 3). Screens in app/(rider) call these.
 */
import { updateOrderStatus } from '@/core/repositories/order.repository';
import { updateUser } from '@/core/repositories/user.repository';
import {
  createRiderSchedule as createSchedule,
  deleteRiderSchedule as deleteSchedule,
  listRiderSchedules,
  updateRiderSchedule as updateSchedule,
  upsertRiderProfile as saveProfile,
} from '@/core/repositories/rider.repository';
import type { Order, OrderStatus } from '@/shared/types/Order';
import type { RiderProfileInput } from '@/shared/types/RiderProfile';
import type { RiderScheduleInput } from '@/shared/types/RiderSchedule';
import { isDrivingLicence, isPersonName, isTenDigitPhone, isVehicleRegistration } from '@/shared/utils/validators';

export {
  listAvailableDeliveries as getAvailableDeliveries,
  listActiveDeliveriesForRider as getActiveDeliveries,
  listRiderHistory as getRiderHistory,
  getRiderStats,
  getOrderById as getDelivery,
  listOrderItems as getDeliveryItems,
  claimDelivery,
  deleteRiderHistoryEntry,
} from '@/core/repositories/order.repository';
export { getRiderProfile } from '@/core/repositories/rider.repository';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validateSchedule(input: RiderScheduleInput) {
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek < 0 || input.dayOfWeek > 6) {
    throw new Error('Choose a valid day.');
  }
  if (!TIME_PATTERN.test(input.startTime) || !TIME_PATTERN.test(input.endTime)) {
    throw new Error('Use 24-hour times in HH:MM format, for example 08:30.');
  }
  if (input.startTime >= input.endTime) {
    throw new Error('End time must be later than start time.');
  }
}

async function ensureNoOverlap(riderId: number, input: RiderScheduleInput, excludeId?: number) {
  const schedules = await listRiderSchedules(riderId);
  const overlap = schedules.some(
    (schedule) =>
      schedule.id !== excludeId &&
      schedule.dayOfWeek === input.dayOfWeek &&
      input.startTime < schedule.endTime &&
      input.endTime > schedule.startTime,
  );
  if (overlap) throw new Error('This shift overlaps another schedule on the same day.');
}

export async function createRiderSchedule(riderId: number, input: RiderScheduleInput) {
  validateSchedule(input);
  await ensureNoOverlap(riderId, input);
  return createSchedule(riderId, input);
}

export async function updateRiderSchedule(id: number, riderId: number, input: RiderScheduleInput) {
  validateSchedule(input);
  await ensureNoOverlap(riderId, input, id);
  return updateSchedule(id, riderId, input);
}

export function deleteRiderSchedule(id: number, riderId: number) {
  return deleteSchedule(id, riderId);
}

export { listRiderSchedules };

export async function saveRiderProfile(riderId: number, input: RiderProfileInput) {
  if (input.vehicleType !== 'bicycle' && !input.vehicleNumber?.trim()) {
    throw new Error('Enter the vehicle registration number.');
  }
  if (input.vehicleType !== 'bicycle' && !input.licenseNumber?.trim()) {
    throw new Error('Enter the driving licence number.');
  }
  if (input.vehicleType !== 'bicycle' && !isVehicleRegistration(input.vehicleNumber ?? '')) {
    throw new Error('Enter a valid vehicle number, for example WP BCD-4582 or CAB-1234.');
  }
  if (input.vehicleType !== 'bicycle' && !isDrivingLicence(input.licenseNumber ?? '')) {
    throw new Error('Driving licence must contain one letter followed by seven digits, for example B1234567.');
  }
  if (!input.emergencyContact?.trim()) {
    throw new Error('Enter an emergency contact number.');
  }
  if (!isTenDigitPhone(input.emergencyContact)) {
    throw new Error('Emergency contact must contain exactly 10 digits.');
  }
  return saveProfile(riderId, input);
}

export type RiderAccountInput = RiderProfileInput & {
  fullName: string;
  mobile: string;
  address: string;
  profileImage?: string | null;
};

export type RiderFieldErrors = Partial<Record<'fullName' | 'mobile' | 'address' | 'emergencyContact' | 'vehicleNumber' | 'licenseNumber', string>>;

export function validateRiderAccount(input: RiderAccountInput): RiderFieldErrors {
  const errors: RiderFieldErrors = {};
  if (!isPersonName(input.fullName)) errors.fullName = 'Enter a valid name using at least 2 characters and no numbers.';
  if (!isTenDigitPhone(input.mobile)) errors.mobile = 'Mobile number must contain exactly 10 digits.';
  if (input.address.trim().length < 5) errors.address = 'Enter a complete address with at least 5 characters.';
  if (!isTenDigitPhone(input.emergencyContact ?? '')) errors.emergencyContact = 'Emergency contact must contain exactly 10 digits.';
  if (input.mobile && input.mobile === input.emergencyContact) errors.emergencyContact = 'Use a different number for the emergency contact.';
  if (input.vehicleType !== 'bicycle') {
    if (!isVehicleRegistration(input.vehicleNumber ?? '')) {
      errors.vehicleNumber = 'Use a valid registration such as WP BCD-4582 or CAB-1234.';
    }
    if (!isDrivingLicence(input.licenseNumber ?? '')) {
      errors.licenseNumber = 'Use 1 letter followed by 7 digits, for example B1234567.';
    }
  }
  return errors;
}

export async function saveRiderAccount(riderId: number, input: RiderAccountInput) {
  const errors = validateRiderAccount(input);
  const firstError = Object.values(errors)[0];
  if (firstError) throw new Error(firstError);
  await saveRiderProfile(riderId, input);
  return updateUser(riderId, {
    fullName: input.fullName,
    mobile: input.mobile,
    address: input.address,
    profileImage: input.profileImage,
  });
}


/** One primary action per delivery stage. */
export function nextRiderAction(order: Order, riderId: number): { status: OrderStatus | 'claim'; label: string } | null {
  if (order.status === 'ready' && !order.riderId) return { status: 'claim', label: 'Accept delivery' };
  if (order.riderId !== riderId) return null;
  switch (order.status) {
    case 'ready':
      return { status: 'picked_up', label: 'Confirm pickup' };
    case 'picked_up':
      return { status: 'on_the_way', label: 'Start delivery' };
    case 'on_the_way':
      return { status: 'delivered', label: 'Complete delivery' };
    default:
      return null;
  }
}

export function moveDelivery(orderId: number, riderId: number, status: Extract<OrderStatus, 'picked_up' | 'on_the_way' | 'delivered'>) {
  return updateOrderStatus(orderId, status, riderId);
}
